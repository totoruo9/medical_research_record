'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Mail, User, Lock, CircleX } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { signInWithEmail, signUp } from '@/lib/actions/auth'
import { toast } from 'sonner'

export default function Home() {
  const [loading, setLoading] = useState(false)

  // Login State
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({ email: '', password: '' })

  // Signup State
  const [signupData, setSignupData] = useState({ email: '', fullName: '', password: '' })
  const [signupErrors, setSignupErrors] = useState({ email: '', fullName: '', password: '' })

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    setLoading(true)
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      },
    })
  }

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const translateAuthError = (error: string) => {
    const errorMsg = error.toLowerCase()
    if (errorMsg.includes('password')) {
      if (errorMsg.includes('6 characters')) {
        return "비밀번호는 최소 6자 이상이어야 합니다."
      }
      return "비밀번호를 확인해주세요."
    }
    if (errorMsg.includes('already registered')) return "이미 가입된 이메일입니다."
    if (errorMsg.includes('invalid login credentials')) return "이메일 또는 비밀번호가 올바르지 않습니다."
    if (errorMsg.includes('rate limit')) return "너무 많은 요청을 보냈습니다. 잠시 후 다시 시도해주세요."
    if (errorMsg.includes('email not confirmed')) return "이메일 인증이 완료되지 않았습니다."

    return error // Fallback to original if unknown
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setLoginErrors({ email: '', password: '' })

    if (!validateEmail(loginData.email)) {
      setLoginErrors(prev => ({ ...prev, email: '유효한 이메일 주소를 입력해주세요.' }))
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('email', loginData.email)
    formData.append('password', loginData.password)

    const result = await signInWithEmail(formData)
    setLoading(false)

    if (result?.error) {
      const translatedError = translateAuthError(result.error)

      // Simple heuristic for mapping errors
      if (result.error.toLowerCase().includes('password') || result.error.toLowerCase().includes('invalid login')) {
        // For login, invalid credentials usually mean checking both, but we can highlight specific ones if we know
        // But for safety, usually good to show generic message. Here we map strictly.
        if (translatedError.includes('비밀번호')) {
          setLoginErrors(prev => ({ ...prev, password: translatedError }))
        } else {
          // Invalid login credentials -> usually implies auth failed. 
          // We can put it under email or password. Let's put under password if generic, or email.
          // Actually common pattern is top level or email. Let's put on Email for visibility.
          setLoginErrors(prev => ({ ...prev, email: translatedError }))
        }
      } else {
        // Default to email/general error on the Email field for visibility
        setLoginErrors(prev => ({ ...prev, email: translatedError }))
      }
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSignupErrors({ email: '', fullName: '', password: '' })

    let hasError = false
    if (!validateEmail(signupData.email)) {
      setSignupErrors(prev => ({ ...prev, email: '유효한 이메일 주소를 입력해주세요.' }))
      hasError = true
    }
    if (signupData.password.length < 6) {
      setSignupErrors(prev => ({ ...prev, password: '비밀번호는 최소 6자 이상이어야 합니다.' }))
      hasError = true
    }
    if (!signupData.fullName) {
      setSignupErrors(prev => ({ ...prev, fullName: '이름을 입력해주세요.' }))
      hasError = true
    }

    if (hasError) {
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append('email', signupData.email)
    formData.append('fullName', signupData.fullName)
    formData.append('password', signupData.password)

    const result = await signUp(formData)
    setLoading(false)

    if (result?.error) {
      const translatedError = translateAuthError(result.error)

      if (result.error.toLowerCase().includes('password')) {
        setSignupErrors(prev => ({ ...prev, password: translatedError }))
      } else {
        // Map everything else (rate limit, already registered, etc.) to email field
        setSignupErrors(prev => ({ ...prev, email: translatedError }))
      }
    } else if (result?.success) {
      toast.success(result.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <Image
            src="/logo_wide.png"
            alt="이음 (I-Eum)"
            width={200}
            height={60}
            className="object-contain h-auto"
            priority
          />
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">로그인</TabsTrigger>
            <TabsTrigger value="signup">회원가입</TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleEmailLogin} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email" className={loginErrors.email ? "text-red-500" : ""}>이메일 <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={loading}
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    className={`pl-10 pr-10 ${loginErrors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                  />
                  {loginData.email && (
                    <button type="button" onClick={() => setLoginData({ ...loginData, email: '' })} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      <CircleX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {loginErrors.email && <p className="text-xs text-red-500">{loginErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className={loginErrors.password ? "text-red-500" : ""}>비밀번호 <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    className={`pl-10 pr-10 ${loginErrors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                  />
                  {loginData.password && (
                    <button type="button" onClick={() => setLoginData({ ...loginData, password: '' })} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      <CircleX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {loginErrors.password && <p className="text-xs text-red-500">{loginErrors.password}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                이메일로 로그인
              </Button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-muted-foreground">또는 소셜 로그인</span>
              </div>
            </div>

            <Button variant="outline" onClick={handleGoogleLogin} disabled={loading} className="w-full">
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path></svg>
              Google 계정으로 계속하기
            </Button>
          </TabsContent>

          {/* Sign Up Tab */}
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4" noValidate>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className={signupErrors.email ? "text-red-500" : ""}>이메일 <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    disabled={loading}
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    className={`pl-10 pr-10 ${signupErrors.email ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                  />
                  {signupData.email && (
                    <button type="button" onClick={() => setSignupData({ ...signupData, email: '' })} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      <CircleX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {signupErrors.email && <p className="text-xs text-red-500">{signupErrors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-fullName" className={signupErrors.fullName ? "text-red-500" : ""}>이름 <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="signup-fullName"
                    name="fullName"
                    type="text"
                    placeholder="홍길동"
                    required
                    disabled={loading}
                    value={signupData.fullName}
                    onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                    className={`pl-10 pr-10 ${signupErrors.fullName ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                  />
                  {signupData.fullName && (
                    <button type="button" onClick={() => setSignupData({ ...signupData, fullName: '' })} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      <CircleX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {signupErrors.fullName && <p className="text-xs text-red-500">{signupErrors.fullName}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className={signupErrors.password ? "text-red-500" : ""}>비밀번호 <span className="text-red-500">*</span></Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="signup-password"
                    name="password"
                    type="password"
                    placeholder="6자 이상 입력해주세요"
                    required
                    disabled={loading}
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    className={`pl-10 pr-10 ${signupErrors.password ? "border-red-500 focus-visible:ring-red-500" : "focus-visible:ring-indigo-500"}`}
                  />
                  {signupData.password && (
                    <button type="button" onClick={() => setSignupData({ ...signupData, password: '' })} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                      <CircleX className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {signupErrors.password ? (
                  <p className="text-xs text-red-500">{signupErrors.password}</p>
                ) : (
                  <p className="text-xs text-gray-500">최소 6자 이상 입력해주세요.</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                계정 만들기
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="pt-4 text-xs text-center text-gray-400">
          계속 진행함으로써 귀하는 서비스의 정책에 동의하게 됩니다.
        </div>
      </div>

      <footer className="absolute bottom-6 w-full text-center">
        <div className="space-x-6 text-sm text-gray-500">
          <Link href="https://ieum-ai.com/terms" className="hover:text-gray-900 underline transition-colors">이용약관</Link>
          <Link href="https://ieum-ai.com/privacy" className="hover:text-gray-900 underline transition-colors">개인정보처리방침</Link>
        </div>
        <p className="mt-2 text-xs text-gray-400">© {new Date().getFullYear()} I-Eum. All rights reserved.</p>
      </footer>
    </div>
  )
}
