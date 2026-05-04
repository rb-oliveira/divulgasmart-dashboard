'use client';

import { useCallback, useState } from 'react';
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { TriggerNode } from './nodes/trigger-node';
import { CommentReplyNode } from './nodes/comment-reply-node';
import { SendDmNode } from './nodes/send-dm-node';
import { SendDmButtonsNode } from './nodes/send-dm-buttons-node';
import { SendDmImageNode } from './nodes/send-dm-image-node';
import { SendDmLinkCardNode } from './nodes/send-dm-link-card-node';
import { ConditionNode } from './nodes/condition-node';
import { DelayNode } from './nodes/delay-node';
import { NodeConfigPanel } from './node-config-panel';
import { FlowToolbar } from './flow-toolbar';
import { useSaveFlow } from '@/hooks/smartchat/useFlow';
import { toast } from 'sonner';

const nodeTypes = {
  TRIGGER: TriggerNode,
  COMMENT_REPLY: CommentReplyNode,
  SEND_DM: SendDmNode,
  SEND_DM_BUTTONS: SendDmButtonsNode,
  SEND_DM_IMAGE: SendDmImageNode,
  SEND_DM_LINK_CARD: SendDmLinkCardNode,
  CONDITION: ConditionNode,
  DELAY: DelayNode,
};

const REQUIRED_MESSAGE_NODES = new Set([
  'COMMENT_REPLY',
  'SEND_DM',
]);

interface DbNode {
  id: string;
  type: string;
  positionX: number;
  positionY: number;
  data: Record<string, any>;
  parentId?: string | null;
  handleId?: string | null;
  order?: number;
}

function dbNodesToFlow(dbNodes: DbNode[]): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = dbNodes.map((n) => ({
    id: n.id,
    type: n.type,
    position: { x: n.positionX, y: n.positionY },
    data: n.data,
  }));
  const edges: Edge[] = dbNodes
    .filter((n) => n.parentId)
    .map((n) => ({
      id: `e-${n.parentId}-${n.id}`,
      source: n.parentId!,
      target: n.id,
      sourceHandle: n.handleId ?? undefined,
    }));
  return { nodes, edges };
}

interface Props {
  automationId: string;
  initialNodes?: DbNode[];
}

export function FlowCanvas({ automationId, initialNodes = [] }: Props) {
  const { nodes: initN, edges: initE } = dbNodesToFlow(initialNodes);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    initN.length
      ? initN
      : [
          {
            id: 'trigger-1',
            type: 'TRIGGER',
            position: { x: 300, y: 50 },
            data: { postId: '', keywords: [] },
          },
        ],
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(initE);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const saveFlow = useSaveFlow(automationId);

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => {
        const withoutExistingTarget = eds.filter((edge) => edge.target !== connection.target);
        return addEdge(connection, withoutExistingTarget);
      }),
    [setEdges],
  );

  const onConnectWithData = useCallback(
    (connection: Connection) => {
      onConnect(connection);
      if (connection.sourceHandle) {
        setNodes((nds) =>
          nds.map((node) =>
            node.id === connection.target && node.type === 'CONDITION'
              ? { ...node, data: { ...node.data, buttonId: connection.sourceHandle } }
              : node,
          ),
        );
      }
    },
    [onConnect, setNodes],
  );

  const onNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const onNodeDataChange = useCallback(
    (nodeId: string, data: Record<string, any>) => {
      setNodes((nds) => nds.map((n) => (n.id === nodeId ? { ...n, data } : n)));
      setSelectedNode((prev) => (prev?.id === nodeId ? { ...prev, data } : prev));
    },
    [setNodes],
  );

  const addNode = useCallback(
    (type: string) => {
      const id = crypto.randomUUID();
      const defaultData: Record<string, any> = {
        SEND_DM_BUTTONS: { message: '', buttons: [] },
        DELAY: { delaySeconds: 60 },
      }[type] ?? {};
      setNodes((nds) => [
        ...nds,
        {
          id,
          type,
          position: { x: 100 + Math.random() * 300, y: 200 + Math.random() * 200 },
          data: defaultData,
        },
      ]);
    },
    [setNodes],
  );

  const validateFlow = () => {
    const triggerNodes = nodes.filter((node) => node.type === 'TRIGGER');
    if (triggerNodes.length !== 1) return 'O fluxo deve conter exatamente um gatilho.';

    for (const node of nodes) {
      const incomingEdge = edges.find((edge) => edge.target === node.id);
      if (node.type !== 'TRIGGER' && !incomingEdge) {
        return `Conecte o no ${node.type?.replace(/_/g, ' ')} ao fluxo.`;
      }

      const data = node.data as Record<string, any>;
      if (REQUIRED_MESSAGE_NODES.has(node.type ?? '') && !String(data.message ?? '').trim()) {
        return `Configure a mensagem do no ${node.type?.replace(/_/g, ' ')}.`;
      }
      if (node.type === 'SEND_DM_IMAGE' && !String(data.imageUrl ?? '').trim()) {
        return 'Configure a URL da imagem.';
      }
      if (node.type === 'SEND_DM_LINK_CARD') {
        if (!String(data.title ?? '').trim()) return 'Configure o titulo do link card.';
        if (!String(data.url ?? '').trim()) return 'Configure a URL do link card.';
      }
      if (
        node.type === 'CONDITION' &&
        !String(data.buttonId ?? incomingEdge?.sourceHandle ?? '').trim()
      ) {
        return 'Configure o ID do botao da condicao.';
      }
      if (node.type === 'SEND_DM_BUTTONS') {
        const buttons = Array.isArray(data.buttons) ? data.buttons : [];
        if (!String(data.message ?? '').trim()) return 'Configure a mensagem dos botoes.';
        if (!buttons.length) return 'Adicione pelo menos um botao.';
        if (buttons.length > 3) return 'Use no maximo 3 botoes.';
        if (buttons.some((button) => !button.id || !String(button.label ?? '').trim())) {
          return 'Preencha o texto de todos os botoes.';
        }
      }
      if (node.type === 'DELAY') {
        const delaySeconds = Number(data.delaySeconds);
        if (!Number.isFinite(delaySeconds) || delaySeconds < 1) {
          return 'Configure um delay maior que zero.';
        }
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validateFlow();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    const dbNodes = nodes.map((n, i) => {
      const edge = edges.find((e) => e.target === n.id);
      return {
        id: n.id,
        type: n.type ?? 'TRIGGER',
        positionX: n.position.x,
        positionY: n.position.y,
        data: n.data as Record<string, any>,
        parentId: edge?.source ?? null,
        handleId: edge?.sourceHandle ?? null,
        order: i,
      };
    });
    try {
      await saveFlow.mutateAsync(dbNodes);
      toast.success('Fluxo salvo!');
    } catch {
      toast.error('Erro ao salvar fluxo');
    }
  };

  return (
    <div className="relative w-full h-full">
      <FlowToolbar
        onSave={handleSave}
        onAddNode={addNode}
        isSaving={saveFlow.isPending}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnectWithData}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap />
      </ReactFlow>
      <NodeConfigPanel
        node={selectedNode}
        onChange={onNodeDataChange}
        onClose={() => setSelectedNode(null)}
      />
    </div>
  );
}
