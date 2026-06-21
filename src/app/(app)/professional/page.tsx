'use client'

import { useState } from 'react'
import {
  Briefcase,
  Plus,
  Trash2,
  Edit,
  Send,
  BarChart2,
  MessageSquare,
  Clock,
  Landmark,
  Settings,
  Users,
  Store,
  BookOpen,
  UserCheck,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function ProfessionalPage() {
  const [activeTab, setActiveTab] = useState('analytics')

  // Mock State for Catalog Items
  const [catalog, setCatalog] = useState([
    { id: 1, name: 'Enterprise Consult', price: '$150/hr', stock: 'Available', desc: '1-on-1 strategy meeting' },
    { id: 2, name: 'KuikChat API Integration Bundle', price: '$499', stock: 'Instant Delivery', desc: 'Developer deployment pack' },
  ])
  const [newItemName, setNewItemName] = useState('')
  const [newItemPrice, setNewItemPrice] = useState('')
  const [newItemDesc, setNewItemDesc] = useState('')

  // Mock State for Quick Replies
  const [replies, setReplies] = useState([
    { shortcut: '/thanks', text: 'Thank you for choosing KuikChat! How else can we assist you today?' },
    { shortcut: '/hours', text: 'Our office hours are Monday through Friday, 9:00 AM to 6:00 PM EST.' },
  ])
  const [newShortcut, setNewShortcut] = useState('')
  const [newReplyText, setNewReplyText] = useState('')

  // Mock State for Broadcasts
  const [broadcasts, setBroadcasts] = useState([
    { id: 1, name: 'All Enterprise Clients', recipients: 12, lastSent: '2026-06-20' },
    { id: 2, name: 'Q3 Leads List', recipients: 45, lastSent: 'Never' },
  ])
  const [newBroadcastName, setNewBroadcastName] = useState('')

  // Add Catalog Item
  const handleAddCatalog = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemName.trim() || !newItemPrice.trim()) {
      toast.error('Name and price are required')
      return
    }
    setCatalog([
      ...catalog,
      {
        id: Date.now(),
        name: newItemName.trim(),
        price: newItemPrice.trim(),
        stock: 'Available',
        desc: newItemDesc.trim(),
      },
    ])
    setNewItemName('')
    setNewItemPrice('')
    setNewItemDesc('')
    toast.success('Catalog item added successfully!')
  }

  // Delete Catalog Item
  const handleDeleteCatalog = (id: number) => {
    setCatalog(catalog.filter((x) => x.id !== id))
    toast.success('Catalog item removed')
  }

  // Add Quick Reply
  const handleAddReply = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newShortcut.trim() || !newReplyText.trim()) {
      toast.error('Shortcut and reply text are required')
      return
    }
    if (!newShortcut.startsWith('/')) {
      toast.error('Shortcut must start with a slash (/)')
      return
    }
    setReplies([
      ...replies,
      { shortcut: newShortcut.trim(), text: newReplyText.trim() },
    ])
    setNewShortcut('')
    setNewReplyText('')
    toast.success('Quick reply template created!')
  }

  // Delete Quick Reply
  const handleDeleteReply = (shortcut: string) => {
    setReplies(replies.filter((x) => x.shortcut !== shortcut))
    toast.success('Quick reply removed')
  }

  // Create Broadcast List
  const handleCreateBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBroadcastName.trim()) {
      toast.error('Broadcast list name is required')
      return
    }
    setBroadcasts([
      ...broadcasts,
      {
        id: Date.now(),
        name: newBroadcastName.trim(),
        recipients: Math.floor(Math.random() * 20) + 1,
        lastSent: 'Never',
      },
    ])
    setNewBroadcastName('')
    toast.success('Broadcast list created!')
  }

  // Trigger Broadcast Send Simulation
  const handleSendBroadcast = (name: string) => {
    toast.success(`Broadcast message dispatched to ${name}`)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background text-foreground">
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border bg-card px-6 shrink-0">
        <div className="flex items-center gap-2.5">
          <Briefcase className="h-5 w-5 text-brand-blue-500" />
          <h1 className="text-lg font-bold tracking-tight text-brand-gradient">
            Professional Mode
          </h1>
          <Badge variant="gradient">Business</Badge>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-4 w-full max-w-xl bg-card border border-border">
            <TabsTrigger value="analytics" className="text-xs font-semibold">
              <BarChart2 className="mr-1.5 h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="catalog" className="text-xs font-semibold">
              <Store className="mr-1.5 h-4 w-4" />
              Catalog
            </TabsTrigger>
            <TabsTrigger value="quickreplies" className="text-xs font-semibold">
              <BookOpen className="mr-1.5 h-4 w-4" />
              Quick Replies
            </TabsTrigger>
            <TabsTrigger value="broadcasts" className="text-xs font-semibold">
              <Send className="mr-1.5 h-4 w-4" />
              Broadcasts
            </TabsTrigger>
          </TabsList>

          {/* 1. Analytics Content */}
          <TabsContent value="analytics" className="space-y-6 outline-none">
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Messages Sent</p>
                <p className="text-3xl font-bold">12,482</p>
                <span className="text-[10px] text-brand-green-500 font-medium">+12% this week</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Messages Received</p>
                <p className="text-3xl font-bold">9,832</p>
                <span className="text-[10px] text-brand-green-500 font-medium">+8% this week</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold">1.4m</p>
                <span className="text-[10px] text-brand-blue-500 font-medium">-15s response gap</span>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Earnings Generated</p>
                <p className="text-3xl font-bold">$2,845</p>
                <span className="text-[10px] text-brand-green-500 font-medium">+24% campaign conversion</span>
              </div>
            </div>

            {/* Performance Overview mock card */}
            <div className="rounded-xl border border-border bg-card p-6 space-y-4">
              <h3 className="font-semibold text-sm">Campaign Click-through Rates</h3>
              <div className="space-y-3">
                {[
                  { label: 'Q3 Promo Blast', pct: 68, count: '30/44 clicked', color: 'bg-brand-blue-500' },
                  { label: 'Product Update Broadcast', pct: 45, count: '9/20 clicked', color: 'bg-brand-green-500' },
                  { label: 'Feedback Survey Request', pct: 28, count: '14/50 clicked', color: 'bg-purple-500' },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-foreground">{item.label}</span>
                      <span className="text-muted-foreground">{item.count} ({item.pct}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-background overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* 2. Catalog Content */}
          <TabsContent value="catalog" className="space-y-6 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Add New Item Card */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="font-semibold text-sm">Add Catalog Item</h3>
                <form onSubmit={handleAddCatalog} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input id="itemName" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} placeholder="e.g. Consult Seat" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="itemPrice">Price</Label>
                    <Input id="itemPrice" value={newItemPrice} onChange={(e) => setNewItemPrice(e.target.value)} placeholder="e.g. $49.99" />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="itemDesc">Description</Label>
                    <Input id="itemDesc" value={newItemDesc} onChange={(e) => setNewItemDesc(e.target.value)} placeholder="Brief description of service" />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full mt-2">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create Item
                  </Button>
                </form>
              </div>

              {/* Items List */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm">Active Catalog Products</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {catalog.map((item) => (
                    <div key={item.id} className="rounded-xl border border-border bg-card/60 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-foreground">{item.name}</h4>
                          <Badge variant="outline" className="text-[10px] text-brand-green-500 border-brand-green-500/30">
                            {item.stock}
                          </Badge>
                        </div>
                        <p className="text-xl font-bold text-brand-blue-500 mt-2">{item.price}</p>
                        <p className="text-xs text-muted-foreground mt-2">{item.desc}</p>
                      </div>
                      <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDeleteCatalog(item.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 3. Quick Replies Content */}
          <TabsContent value="quickreplies" className="space-y-6 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Add New Quick Reply */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="font-semibold text-sm">Create Shortcut Template</h3>
                <form onSubmit={handleAddReply} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="shortcut">Shortcut Trigger</Label>
                    <Input id="shortcut" value={newShortcut} onChange={(e) => setNewShortcut(e.target.value)} placeholder="e.g. /thanks" />
                    <p className="text-[10px] text-muted-foreground">Must begin with a slash (/) symbol</p>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="replyText">Reply Body</Label>
                    <Input id="replyText" value={newReplyText} onChange={(e) => setNewReplyText(e.target.value)} placeholder="Type full text message template" />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full mt-2">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Save Template
                  </Button>
                </form>
              </div>

              {/* Shortcuts list */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm">Configured Shortcuts</h3>
                <div className="space-y-3">
                  {replies.map((reply) => (
                    <div key={reply.shortcut} className="rounded-xl border border-border bg-card/60 p-4 flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <Badge className="font-mono bg-brand-blue-500/10 text-brand-blue-500 border-none hover:bg-brand-blue-500/20">
                          {reply.shortcut}
                        </Badge>
                        <p className="text-xs text-foreground mt-1.5">{reply.text}</p>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive shrink-0 hover:bg-destructive/10" onClick={() => handleDeleteReply(reply.shortcut)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* 4. Broadcast Lists Content */}
          <TabsContent value="broadcasts" className="space-y-6 outline-none">
            <div className="grid gap-6 md:grid-cols-3">
              {/* Create Broadcast List */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <h3 className="font-semibold text-sm">Create Broadcast List</h3>
                <form onSubmit={handleCreateBroadcast} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="broadcastName">Broadcast List Name</Label>
                    <Input id="broadcastName" value={newBroadcastName} onChange={(e) => setNewBroadcastName(e.target.value)} placeholder="e.g. Premium Customers" />
                  </div>
                  <Button type="submit" variant="gradient" className="w-full mt-2">
                    <Plus className="mr-1.5 h-4 w-4" />
                    Create List
                  </Button>
                </form>
              </div>

              {/* Broadcasts List */}
              <div className="md:col-span-2 space-y-4">
                <h3 className="font-semibold text-sm">Active Broadcast Lists</h3>
                <div className="space-y-3">
                  {broadcasts.map((list) => (
                    <div key={list.id} className="rounded-xl border border-border bg-card/60 p-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-foreground">{list.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {list.recipients} recipients • Last Sent: {list.lastSent}
                        </p>
                      </div>
                      <Button size="sm" variant="outline" className="flex items-center gap-1.5 text-brand-blue-500 hover:bg-brand-blue-500/5 hover:text-brand-blue-600 border-brand-blue-500/30" onClick={() => handleSendBroadcast(list.name)}>
                        <Send className="h-3.5 w-3.5" />
                        Send Now
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
