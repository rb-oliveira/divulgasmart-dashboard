"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Lock, Mail, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setIsLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (authError) {
        setError(authError.message === "Invalid login credentials"
          ? "Credenciais inválidas. Verifique seu e-mail e senha."
          : authError.message)
        return
      }

      router.push("/lojas")
      router.refresh()
    } catch (e) {
      setError("Ocorreu um erro ao tentar fazer login. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md space-y-4">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="rounded-full bg-primary p-3 text-primary-foreground">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">DivulgaSmart</h1>
          <p className="text-sm text-muted-foreground">
            Faça login para gerenciar suas lojas e grupos.
          </p>
        </div>

        <Card className="border-none shadow-lg">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl">Login</CardTitle>
            <CardDescription>
              Entre com suas credenciais para continuar
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="exemplo@email.com"
                            className="pl-9"
                            type="email"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="••••••••"
                            className="pl-9"
                            type="password"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Entrando...
                    </>
                  ) : (
                    "Entrar"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
            <div className="hover:text-primary transition-colors cursor-pointer">
              Esqueceu a senha?
            </div>
            <div>
              Não tem conta? <span className="text-primary font-medium hover:underline cursor-pointer">Crie uma agora</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
