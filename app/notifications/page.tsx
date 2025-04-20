"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCircle, Clock, Info, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DashboardHeader } from "@/components/dashboard-header"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/hooks/use-notifications"

export default function NotificationsPage() {
  const router = useRouter()
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearNotifications } = useNotifications()
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all")

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    return true
  })

  // Handle mark as read
  const handleMarkAsRead = (id: string) => {
    markAsRead(id)
  }

  // Handle mark all as read
  const handleMarkAllAsRead = () => {
    markAllAsRead()
  }

  // Handle delete notification
  const handleDeleteNotification = (id: string) => {
    deleteNotification(id)
  }

  // Handle clear all
  const handleClearAll = () => {
    clearNotifications()
  }

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />

      <main className="flex-1 p-4 md:p-6 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto max-w-4xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Bell className="h-6 w-6" />
                Notifications
              </h1>
              <p className="text-slate-500 dark:text-slate-400">Stay updated with important alerts and reminders</p>
            </div>

            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllAsRead}
                disabled={!notifications.some((n) => !n.read)}
              >
                Mark All as Read
              </Button>
              <Button variant="outline" size="sm" onClick={handleClearAll} disabled={notifications.length === 0}>
                Clear All
              </Button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2 mb-4">
            <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
              All
            </Button>
            <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
              Unread
            </Button>
            <Button variant={filter === "read" ? "default" : "outline"} size="sm" onClick={() => setFilter("read")}>
              Read
            </Button>
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Bell className="h-12 w-12 text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-xl font-medium mb-2">No notifications</h3>
                <p className="text-slate-500 dark:text-slate-400">
                  {filter === "all"
                    ? "You don't have any notifications yet"
                    : filter === "unread"
                      ? "You don't have any unread notifications"
                      : "You don't have any read notifications"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={cn("transition-all", !notification.read ? "border-l-4 border-l-blue-500" : "")}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{getIcon(notification.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{notification.title}</h3>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{notification.message}</p>
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-xs text-slate-500 dark:text-slate-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                            </span>

                            {notification.actionUrl && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => router.push(notification.actionUrl!)}
                              >
                                {notification.actionText}
                              </Button>
                            )}

                            {!notification.read && (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0 text-xs"
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                Mark as read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDeleteNotification(notification.id)}
                      >
                        <X className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
