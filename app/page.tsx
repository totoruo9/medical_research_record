
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-indigo-50 to-blue-50">
      <div className="text-center space-y-6 max-w-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-blue-900">
          췌장암 환자 케어 플랫폼
        </h1>
        <p className="text-lg text-gray-600">
          혈액 검사, CT 결과, 치료 기록을 한곳에서 관리하고 <br />
          AI 전문의의 맞춤형 분석 리포트를 받아보세요.
        </p>
        <div className="pt-8">
          <Link href="/login">
            <Button size="lg" className="px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
              지금 시작하기
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
