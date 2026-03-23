'use client'

import { useState, useEffect } from 'react'
import { useLocale } from '@/lib/locale-context'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DollarSign, TrendingUp, TrendingDown, Calendar, Users, ArrowUpRight, Loader2 } from 'lucide-react'

type EarningsData = {
  currentMonth: {
    revenue: number
    lessons: number
    avgPrice: number
    change: number
  }
  lastMonth: {
    revenue: number
    lessons: number
    avgPrice: number
  }
  yearToDate: {
    revenue: number
    lessons: number
  }
  recentPayments: Array<{
    id: string
    student: string
    program: string
    amount: number
    date: string
  }>
  byProgram: Array<{
    program: string
    revenue: number
    lessons: number
    percentage: number
  }>
}

export default function AdminEarningsPage() {
  const { t } = useLocale()
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/earnings')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <>
        <DashboardHeader title={t.dashboard.admin.earnings} />
        <main className="p-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </>
    )
  }

  if (!data) {
    return (
      <>
        <DashboardHeader title={t.dashboard.admin.earnings} />
        <main className="p-6">
          <div className="py-20 text-center text-muted-foreground">
            <DollarSign className="mx-auto mb-3 h-10 w-10 opacity-40" />
            <p>No earnings data available yet</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <DashboardHeader title={t.dashboard.admin.earnings} />
      
      <main className="p-6">
        {/* Overview Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.dashboard.admin.monthlyRevenue}</p>
                  <p className="mt-1 text-3xl font-bold">€{data.currentMonth.revenue}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent/20">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {data.currentMonth.change > 0 ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-accent" />
                    <span className="text-accent">+{data.currentMonth.change}%</span>
                  </>
                ) : data.currentMonth.change < 0 ? (
                  <>
                    <TrendingDown className="mr-1 h-4 w-4 text-destructive" />
                    <span className="text-destructive">{data.currentMonth.change}%</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">0%</span>
                )}
                <span className="ml-1 text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.dashboard.admin.totalLessons}</p>
                  <p className="mt-1 text-3xl font-bold">{data.currentMonth.lessons}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {data.currentMonth.lessons > data.lastMonth.lessons ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-accent" />
                    <span className="text-accent">+{data.currentMonth.lessons - data.lastMonth.lessons}</span>
                  </>
                ) : data.currentMonth.lessons < data.lastMonth.lessons ? (
                  <>
                    <TrendingDown className="mr-1 h-4 w-4 text-destructive" />
                    <span className="text-destructive">{data.currentMonth.lessons - data.lastMonth.lessons}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">0</span>
                )}
                <span className="ml-1 text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t.dashboard.admin.avgPrice}</p>
                  <p className="mt-1 text-3xl font-bold">€{data.currentMonth.avgPrice}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-2/20">
                  <ArrowUpRight className="h-6 w-6 text-chart-2" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {data.currentMonth.avgPrice > data.lastMonth.avgPrice ? (
                  <>
                    <TrendingUp className="mr-1 h-4 w-4 text-accent" />
                    <span className="text-accent">+€{data.currentMonth.avgPrice - data.lastMonth.avgPrice}</span>
                  </>
                ) : data.currentMonth.avgPrice < data.lastMonth.avgPrice ? (
                  <>
                    <TrendingDown className="mr-1 h-4 w-4 text-destructive" />
                    <span className="text-destructive">-€{data.lastMonth.avgPrice - data.currentMonth.avgPrice}</span>
                  </>
                ) : (
                  <span className="text-muted-foreground">€0</span>
                )}
                <span className="ml-1 text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Year to Date</p>
                  <p className="mt-1 text-3xl font-bold">€{data.yearToDate.revenue}</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-chart-4/20">
                  <Users className="h-6 w-6 text-chart-4" />
                </div>
              </div>
              <div className="mt-4 text-sm text-muted-foreground">
                {data.yearToDate.lessons} lessons completed
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue by Program */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Revenue by Program</CardTitle>
              <CardDescription>This month's breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              {data.byProgram.length > 0 ? (
                <div className="space-y-4">
                  {data.byProgram.map((item) => (
                    <div key={item.program}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium">{item.program}</span>
                        <span className="text-muted-foreground">
                          €{item.revenue} ({item.lessons} lessons)
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No data for this month</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Recent Payments</CardTitle>
              <CardDescription>Latest transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {data.recentPayments.length > 0 ? (
                <div className="space-y-4">
                  {data.recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-medium">
                          {payment.student ? payment.student.split(' ').map(n => n[0]).join('') : '?'}
                        </div>
                        <div>
                          <p className="font-medium">{payment.student}</p>
                          <p className="text-sm text-muted-foreground">{payment.program}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-accent">+€{payment.amount}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(payment.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-muted-foreground">No recent payments</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Comparison */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="font-serif">Monthly Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">This Month</p>
                <p className="mt-1 text-2xl font-bold">€{data.currentMonth.revenue}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.currentMonth.lessons} lessons
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Last Month</p>
                <p className="mt-1 text-2xl font-bold">€{data.lastMonth.revenue}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {data.lastMonth.lessons} lessons
                </p>
              </div>
              <div className="rounded-lg bg-muted/50 p-4">
                <p className="text-sm text-muted-foreground">Difference</p>
                <p className="mt-1 text-2xl font-bold text-accent">
                  +€{data.currentMonth.revenue - data.lastMonth.revenue}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  +{data.currentMonth.lessons - data.lastMonth.lessons} lessons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  )
}