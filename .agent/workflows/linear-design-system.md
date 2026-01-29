---
description: Linear Theme Design System - 프로젝트 전체에서 일관된 UI를 위한 디자인 시스템 규칙
---

# Linear Theme Design System Rules

이 문서는 프로젝트에서 Linear Theme 디자인 시스템을 일관되게 사용하기 위한 규칙을 정의합니다.

## 컴포넌트 구조

기존 **shadcn/ui** 컴포넌트와 **Linear UI 확장 컴포넌트**를 함께 사용합니다.

```tsx
// 기존 shadcn/ui 컴포넌트
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

// Linear UI 확장 컴포넌트 (L- 접두사)
import { 
    LCard, LCardHeader, LCardIcon, LCardTitle, LCardContent, LCardFooter, LCardLink,
    LBadge, LMetricValue, LMetricLabel, LMetricGroup, LMetricItem, LMetricDivider,
    LSectionHeader, LSectionIcon, LSectionTitle,
    LListItem, LListItemHeader, LListItemTitle, LListItemTime, LListItemDescription,
    LEmptyState, linearTheme
} from '@/components/linear-ui'
```

## Linear UI 컴포넌트 목록

### 카드 컴포넌트
| 컴포넌트 | 용도 |
|----------|------|
| `LCard` | 메트릭 카드, 섹션 컨테이너 (`accent`: blue, green, red, purple, orange) |
| `LCardHeader` | 카드 헤더 영역 (아이콘 + 타이틀) |
| `LCardIcon` | 아이콘 배경 (`color`: blue, green, red, purple, orange) |
| `LCardTitle` | 카드 제목 |
| `LCardContent` | 카드 본문 |
| `LCardFooter` | 카드 푸터 (링크 영역) |
| `LCardLink` | 카드 내 링크 |

### 메트릭 컴포넌트
| 컴포넌트 | 용도 |
|----------|------|
| `LMetricValue` | 큰 숫자/날짜 표시 |
| `LMetricLabel` | 메트릭 라벨 (uppercase) |
| `LMetricGroup` | 메트릭 그룹 컨테이너 |
| `LMetricItem` | 개별 메트릭 |
| `LMetricDivider` | 메트릭 구분선 |

### 섹션/리스트 컴포넌트
| 컴포넌트 | 용도 |
|----------|------|
| `LSectionHeader` | 섹션 헤더 (그라데이션 배경) |
| `LSectionIcon` | 섹션 아이콘 |
| `LSectionTitle` | 섹션 제목 |
| `LListItem` | 리스트 아이템 (hover 효과) |
| `LListItemHeader` | 리스트 아이템 헤더 |
| `LListItemTitle` | 리스트 아이템 제목 |
| `LListItemTime` | 시간 표시 |
| `LListItemDescription` | 설명 (line-clamp-2) |

### 기타
| 컴포넌트 | 용도 |
|----------|------|
| `LBadge` | 상태 배지 (`variant`: default, success, warning, error, info, purple, new) |
| `LEmptyState` | 빈 상태 표시 |

## 사용 예시

### 메트릭 카드
```tsx
<LCard accent="blue">
    <LCardHeader>
        <LCardIcon color="blue">
            <Activity size={16} />
        </LCardIcon>
        <LCardTitle>최근 혈액 검사</LCardTitle>
    </LCardHeader>
    <LCardContent>
        <LMetricValue>2026.08.26</LMetricValue>
        <LMetricGroup>
            <LMetricItem>
                <LMetricLabel>CA 19-9</LMetricLabel>
                <span className="text-sm font-semibold">20</span>
            </LMetricItem>
            <LMetricDivider />
            <LMetricItem>
                <LMetricLabel>CEA</LMetricLabel>
                <span className="text-sm font-semibold">5</span>
            </LMetricItem>
        </LMetricGroup>
    </LCardContent>
    <LCardFooter>
        <LCardLink href="/blood-tests" className="text-blue-600">
            자세히 보기 <ChevronRight size={16} />
        </LCardLink>
    </LCardFooter>
</LCard>
```

### 리스트 섹션
```tsx
<LCard>
    <LSectionHeader>
        <div className="flex items-center gap-3">
            <LSectionIcon><Brain size={20} /></LSectionIcon>
            <LSectionTitle>최근 AI 정밀 분석</LSectionTitle>
        </div>
        <LCardLink href="/reports" className="text-violet-600">
            전체보기 <ChevronRight size={14} />
        </LCardLink>
    </LSectionHeader>
    
    {reports.map((report) => (
        <LListItem key={report.id} href="/reports">
            <LListItemHeader>
                <LListItemTitle>{report.title}</LListItemTitle>
                <LListItemTime>{report.time}</LListItemTime>
            </LListItemHeader>
            <LListItemDescription>{report.content}</LListItemDescription>
        </LListItem>
    ))}
</LCard>
```

## 스타일링 규칙

1. **Tailwind CSS 클래스 사용** (인라인 스타일 금지)
2. **CVA 패턴** 사용 (`class-variance-authority`)
3. **cn() 유틸리티**로 클래스 병합
4. **data-slot 속성**으로 컴포넌트 식별

## 파일 구조

```
components/
├── ui/                    # shadcn/ui 컴포넌트
│   ├── button.tsx
│   ├── card.tsx
│   └── ...
└── linear-ui/             # Linear UI 확장 컴포넌트
    └── index.tsx
```

## 데모 페이지

- **대시보드 적용 예시**: `/experiments/linear-dashboard`
- **컴포넌트 데모**: `/experiments/linear-components`
