'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { BarChart2, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PollRow, PollOption, PollVoteRow } from '@/lib/chat/types'

interface PollWidgetProps {
  messageId: string
  chatId: string
  currentUserId: string
}

export function PollWidget({ messageId, chatId, currentUserId }: PollWidgetProps) {
  const [poll, setPoll] = useState<PollRow | null>(null)
  const [votes, setVotes] = useState<PollVoteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [votingOptId, setVotingOptId] = useState<string | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    async function loadPoll() {
      // Fetch poll
      const { data: pollData } = await supabase
        .from('polls')
        .select('*')
        .eq('message_id', messageId)
        .single()
      
      if (pollData) {
        setPoll(pollData as PollRow)
        // Fetch votes
        const { data: votesData } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('poll_id', pollData.id)
        
        if (votesData) {
          setVotes(votesData as PollVoteRow[])
        }
      }
      setLoading(false)
    }

    loadPoll()

  }, [messageId, supabase])

  useEffect(() => {
    if (!poll?.id) return

    // Realtime for votes
    const channel = supabase
      .channel(`poll_votes_${messageId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'poll_votes', filter: `poll_id=eq.${poll.id}` }, (payload: any) => {
        const newVote = payload.new as PollVoteRow
        setVotes(prev => {
          // If not multiple, remove previous vote from same user
          if (poll?.is_multiple === false) {
            return [...prev.filter(v => v.user_id !== newVote.user_id), newVote]
          }
          return [...prev, newVote]
        })
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'poll_votes', filter: `poll_id=eq.${poll.id}` }, (payload: any) => {
        const oldVote = payload.old
        setVotes(prev => prev.filter(v => v.id !== oldVote.id))
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [messageId, supabase, poll?.id, poll?.is_multiple])

  if (loading) return <div className="p-4 text-sm text-muted-foreground animate-pulse flex items-center gap-2"><BarChart2 className="w-4 h-4"/> Loading poll...</div>
  if (!poll) return <div className="p-4 text-sm text-muted-foreground">Poll not found.</div>

  const totalVotes = votes.length
  const myVotes = votes.filter(v => v.user_id === currentUserId).map(v => v.option_id)
  
  const isClosed = poll.closes_at ? new Date(poll.closes_at).getTime() < Date.now() : false

  const handleVote = async (optionId: string) => {
    if (isClosed) return
    
    setVotingOptId(optionId)
    const hasVotedForThis = myVotes.includes(optionId)

    if (hasVotedForThis) {
      // Remove vote
      await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', poll.id)
        .eq('user_id', currentUserId)
        .eq('option_id', optionId)
    } else {
      // If not multiple, we might want to delete previous votes first
      if (!poll.is_multiple) {
        await supabase
          .from('poll_votes')
          .delete()
          .eq('poll_id', poll.id)
          .eq('user_id', currentUserId)
      }
      // Add vote
      await supabase
        .from('poll_votes')
        .insert({
          poll_id: poll.id,
          user_id: currentUserId,
          option_id: optionId
        })
    }
    setVotingOptId(null)
  }

  return (
    <div className="flex flex-col gap-3 min-w-[240px] max-w-[320px] rounded-xl bg-background/5 p-1">
      <div className="flex items-start gap-2">
        <div className="flex mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-brand-blue-500/20 text-brand-blue-500">
          <BarChart2 className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm text-foreground/90 leading-tight">
            {poll.question}
          </p>
          <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground font-medium">
            <span>{poll.is_anonymous ? 'Anonymous' : 'Public'}</span>
            <span>•</span>
            <span>{poll.is_multiple ? 'Multiple choices' : 'Single choice'}</span>
            {poll.closes_at && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3"/>
                  {isClosed ? 'Closed' : 'Ends soon'}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {poll.options.map((opt) => {
          const optVotes = votes.filter(v => v.option_id === opt.id)
          const percentage = totalVotes > 0 ? Math.round((optVotes.length / totalVotes) * 100) : 0
          const isSelected = myVotes.includes(opt.id)

          return (
            <button
              key={opt.id}
              onClick={() => handleVote(opt.id)}
              disabled={isClosed || votingOptId !== null}
              className={cn(
                "group relative flex min-h-[40px] w-full items-center justify-between overflow-hidden rounded-lg border px-3 py-2 text-left transition-all",
                isSelected
                  ? "border-brand-blue-500/50 bg-brand-blue-500/10"
                  : "border-border/50 bg-accent/20 hover:bg-accent/40",
                (isClosed || votingOptId !== null) && "cursor-default hover:bg-accent/20"
              )}
            >
              {/* Progress Bar Background */}
              <div 
                className={cn(
                  "absolute bottom-0 left-0 top-0 transition-all duration-500 ease-out",
                  isSelected ? "bg-brand-blue-500/20" : "bg-muted-foreground/10"
                )}
                style={{ width: `${percentage}%` }}
              />
              
              <div className="relative z-10 flex items-center gap-2 max-w-[80%]">
                {isSelected ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-blue-500" />
                ) : (
                  <div className="h-4 w-4 shrink-0 rounded-full border border-muted-foreground/30 group-hover:border-muted-foreground/50" />
                )}
                <span className={cn(
                  "text-sm font-medium leading-tight",
                  isSelected ? "text-brand-blue-600 dark:text-brand-blue-400" : "text-foreground/80"
                )}>
                  {opt.text}
                </span>
              </div>
              
              <div className="relative z-10 flex items-center gap-2">
                {optVotes.length > 0 && !poll.is_anonymous && (
                  <div className="flex -space-x-1">
                    {/* In a real app we would join with profiles and show mini avatars here */}
                    {optVotes.slice(0, 3).map((v, i) => (
                      <div key={i} className="h-4 w-4 rounded-full bg-zinc-400 border border-background" />
                    ))}
                  </div>
                )}
                <span className="text-xs font-semibold text-muted-foreground w-8 text-right">
                  {percentage}%
                </span>
              </div>
            </button>
          )
        })}
      </div>
      <div className="mt-1 text-[11px] font-medium text-muted-foreground/80 pl-8">
        {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
      </div>
    </div>
  )
}
