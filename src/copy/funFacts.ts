/**
 * Given how much time passed and how much time was *missed*, generate
 * a handful of playful, relatable facts about what the traveler skipped.
 * Pure functions over Decimal — no physics here, just narrative.
 */
import Decimal from 'decimal.js'
import { JULIAN_YEAR_SECONDS, DAY_SECONDS } from '../physics/constants'

export interface FunFact {
  readonly icon: string
  readonly text: string
}

/**
 * Pick facts keyed to the magnitude of `missedSeconds` (the amount of
 * reference time that elapsed beyond the traveler's own aging).
 * Positive = traveler aged less (missed stuff); negative = traveler aged more.
 */
export function funFactsForMiss(missedSeconds: Decimal): FunFact[] {
  const abs = missedSeconds.abs()
  const missedMore = missedSeconds.isNegative() // traveler aged more than ref
  const facts: FunFact[] = []

  if (abs.lt('1e-9')) {
    facts.push({ icon: '🕰', text: 'Your grandfather clock would barely notice.' })
    facts.push({ icon: '⚛', text: 'Measurable only by atomic clocks.' })
    return facts
  }

  if (abs.lt('1e-6')) {
    const ns = abs.times('1e9').toNumber()
    facts.push({
      icon: '⚛',
      text: `About ${formatCount(ns)} nanoseconds — the time light takes to cross your breakfast.`,
    })
    facts.push({
      icon: '📡',
      text: 'GPS satellites correct for effects at exactly this scale, every second of every day.',
    })
    return facts
  }

  if (abs.lt('1e-3')) {
    const us = abs.times('1e6').toNumber()
    facts.push({
      icon: '⚡',
      text: `Around ${formatCount(us)} microseconds — the lifespan of a keystroke.`,
    })
    facts.push({
      icon: '🔬',
      text: 'Visible in a physics lab. Invisible in any human experience.',
    })
    return facts
  }

  if (abs.lt(1)) {
    const ms = abs.times(1000).toNumber()
    facts.push({ icon: '👁', text: `${formatCount(ms)} ms — a blink takes longer.` })
    facts.push({ icon: '💓', text: 'About as long as half a heartbeat.' })
    return facts
  }

  if (abs.lt(60)) {
    const s = abs.toNumber()
    facts.push({ icon: '💓', text: `${formatCount(s * 1.1)} heartbeats unspent.` })
    facts.push({ icon: '☕', text: 'About one sip of coffee\'s worth of existence.' })
    return facts
  }

  if (abs.lt(3600)) {
    const minutes = abs.div(60).toNumber()
    facts.push({ icon: '📺', text: `${formatCount(minutes)} minutes — roughly a TV episode.` })
    facts.push({ icon: '🏃', text: `You could have run ${formatCount(minutes * 0.15)} kilometres.` })
    return facts
  }

  if (abs.lt(DAY_SECONDS)) {
    const hours = abs.div(3600).toNumber()
    facts.push({ icon: '🌅', text: `${formatCount(hours)} hours — a flight across the ocean.` })
    facts.push({ icon: '😴', text: `${formatCount(hours / 8)} full nights of sleep either owed or refunded.` })
    return facts
  }

  if (abs.lt(JULIAN_YEAR_SECONDS)) {
    const days = abs.div(DAY_SECONDS).toNumber()
    facts.push({ icon: '🗓', text: `${formatCount(days)} days — ${formatCount(days / 7)} weekends worth.` })
    facts.push({ icon: '🌙', text: `The Moon would have made ${formatCount(days / 29.5)} full cycles.` })
    facts.push({
      icon: '🐶',
      text: `Your dog ${missedMore ? 'would barely remember you' : 'would still forgive you'}.`,
    })
    return facts
  }

  // Years.
  const years = abs.div(JULIAN_YEAR_SECONDS).toNumber()

  if (years < 5) {
    facts.push(countFact('🥂', years, "New Year's Eve", "New Year's Eves", 'celebrated without you'))
    facts.push(countFact('📱', years, 'new iPhone', 'new iPhones', 'announced'))
    facts.push({ icon: '🐕', text: `Your dog aged about ${formatCount(years * 7)} dog-years.` })
    if (years >= 2) facts.push(countFact('🏅', years / 2, 'Olympic Games', 'Olympic Games', 'held'))
    return facts
  }

  if (years < 50) {
    facts.push(countFact('⚽', years / 4, 'World Cup', 'World Cups', 'played without you'))
    facts.push(countFact('🗳', years / 4, 'U.S. presidential election', 'U.S. presidential elections', 'decided'))
    facts.push({
      icon: '🎂',
      text: missedMore
        ? `You had ${Math.floor(years)} more birthdays than your friends.`
        : `Your friends had ${Math.floor(years)} birthdays you missed.`,
    })
    if (years >= 10) facts.push(countFact('📺', years / 10, 'decade of TV', 'decades of TV', 'you never saw'))
    return facts
  }

  if (years < 200) {
    facts.push({ icon: '🏙', text: `${formatCount(years / 30)} generations rose and cycled out.` })
    facts.push({ icon: '📚', text: `Entire literary movements began and ended without you.` })
    facts.push({ icon: '💀', text: `Most people you ever met are gone.` })
    facts.push({ icon: '🗺', text: `The political map is unrecognisable.` })
    return facts
  }

  if (years < 10000) {
    facts.push({ icon: '⚔', text: 'Empires rose. Empires fell. You were in transit.' })
    facts.push({ icon: '🏛', text: 'The oldest living thing from your departure is dust.' })
    facts.push({ icon: '🗿', text: `Your native language is an object of academic study.` })
    return facts
  }

  if (years < 1e6) {
    facts.push({ icon: '🧊', text: 'Ice ages have come and gone.' })
    facts.push({ icon: '🦣', text: 'Species have evolved and others have disappeared.' })
    facts.push({ icon: '📜', text: 'No written record of your departure exists anywhere.' })
    return facts
  }

  facts.push({ icon: '🌋', text: 'Continents have visibly moved.' })
  facts.push({ icon: '🦖', text: 'Geological epochs have turned over.' })
  facts.push({ icon: '🌌', text: 'The stars in your sky are in subtly different places.' })
  return facts
}

/** "3 World Cups played without you" — whole events only, never "1.4 World Cups". */
function countFact(icon: string, n: number, one: string, many: string, tail: string): FunFact {
  const k = Math.floor(n)
  if (k < 1) return { icon, text: `Almost a whole ${one} ${tail}.` }
  return { icon, text: `${k.toLocaleString('en-US')} ${k === 1 ? one : many} ${tail}.` }
}

/** Friendly formatting — 1 decimal, with thousand separators for big numbers. */
function formatCount(n: number): string {
  if (!Number.isFinite(n)) return '—'
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 10) return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  if (n >= 1) return n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}
