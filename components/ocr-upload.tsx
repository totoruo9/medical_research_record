'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2, FileImage, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OCRUploadProps {
    type: 'blood_test' | 'ct_scan'
    onUploadComplete: (data: any) => void
    className?: string
}

export function OCRUpload({ type, onUploadComplete, className }: OCRUploadProps) {
    const [loading, setLoading] = useState(false)
    const [processed, setProcessed] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        console.log('Files dropped:', acceptedFiles)
        if (acceptedFiles.length === 0) return

        setLoading(true)
        setError(null)
        setProcessed(false)

        const formData = new FormData()
        acceptedFiles.forEach(file => {
            formData.append('file', file)
        })
        formData.append('type', type)

        try {
            const res = await fetch('/api/ocr', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'OCR Analysis failed')
            }

            console.log('OCR Result:', data)
            onUploadComplete(data)
            setProcessed(true)
        } catch (e: any) {
            console.error('OCR Error:', e)
            setError(e.message)
        } finally {
            setLoading(false)
        }
    }, [type, onUploadComplete])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected: (fileRejections) => {
            console.log('Drop rejected:', fileRejections)
            setError(`파일이 거부되었습니다. (${fileRejections[0].errors[0].message})`)
        },
        onDragEnter: () => console.log('Drag enter'),
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/webp': ['.webp'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 10,
        disabled: loading
    })

    return (
        <div
            {...getRootProps()}
            className={cn(
                "border-2 border-dashed rounded-lg p-6 transition-colors cursor-pointer text-center",
                isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300",
                loading ? "opacity-50 cursor-not-allowed" : "",
                processed ? "border-green-500 bg-green-50" : "",
                error ? "border-red-300 bg-red-50" : "",
                className
            )}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center justify-center space-y-2">
                {loading ? (
                    <>
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                        <p className="text-sm font-medium text-blue-700">AI가 이미지를 분석하고 있습니다...</p>
                        <p className="text-xs text-blue-500">잠시만 기다려주세요.</p>
                    </>
                ) : processed ? (
                    <>
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <p className="text-sm font-medium text-green-700">분석 완료!</p>
                        <p className="text-xs text-green-500">데이터가 양식에 자동 입력되었습니다.</p>
                    </>
                ) : error ? (
                    <>
                        <XCircle className="h-8 w-8 text-red-500" />
                        <p className="text-sm font-medium text-red-700">오류 발생</p>
                        <p className="text-xs text-red-500">{error}</p>
                    </>
                ) : (
                    <>
                        <div className="p-3 bg-gray-100 rounded-full mb-2">
                            <Upload className="h-6 w-6 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">
                            {type === 'blood_test' ? '혈액검사 결과지' : 'CT 판독지'}를 여기에 드래그하거나 클릭하세요.
                        </p>
                        <p className="text-xs text-gray-400">
                            이미지 파일 (JPG, PNG) 또는 PDF 지원 (최대 10개)
                        </p>
                    </>
                )}
            </div>
        </div>
    )
}
