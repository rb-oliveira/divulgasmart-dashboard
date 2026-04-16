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
  DELAY: DelayNode,
};

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
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges],
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
      const defaultData: Record<string, any> =
        type === 'SEND_DM_BUTTONS' ? { message: '', buttons: [] } : {};
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

  const handleSave = async () => {
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
        onConnect={onConnect}
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
