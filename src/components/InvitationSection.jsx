'use client';

import { motion } from 'framer-motion';
import { CalendarPlus, Clock3, Map, MapPin, Shirt, Sparkles } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1], staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.1, 0.25, 1] } },
};

function safeExternalUrl(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : '';
  } catch {
    return '';
  }
}

function parseLocalDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || '');
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function getDateParts(value) {
  const date = parseLocalDate(value);
  if (!date) return { month: 'SAVE THE DATE', day: '', weekday: 'DATE TO BE ANNOUNCED' };

  return {
    month: new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date).toUpperCase(),
    day: new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date),
    weekday: new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(date).toUpperCase(),
  };
}

function escapeCalendarText(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function toCalendarDate(date, time) {
  if (!date) return '';
  return `${date.replace(/-/g, '')}T${(time || '00:00').replace(':', '')}00`;
}

function downloadCalendar(invitation) {
  if (!invitation.date) return;

  const start = toCalendarDate(invitation.date, invitation.startTime);
  const end = invitation.endTime ? toCalendarDate(invitation.date, invitation.endTime) : '';
  const location = [invitation.venueName, invitation.address].filter(Boolean).join(', ');
  const description = [invitation.message, invitation.notes].filter(Boolean).join('\n\n');
  const contents = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//For You Always//Memoria Invitation//EN',
    'BEGIN:VEVENT',
    `DTSTART:${start}`,
    ...(end ? [`DTEND:${end}`] : []),
    `SUMMARY:${escapeCalendarText(invitation.title2 || invitation.title1 || 'A special celebration')}`,
    `LOCATION:${escapeCalendarText(location)}`,
    `DESCRIPTION:${escapeCalendarText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([contents], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'memoria-invitation.ics';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function DetailRow({ icon: Icon, title, children }) {
  if (!children) return null;

  return (
    <div className="flex items-start gap-3 border-t border-text/10 pt-4 text-left">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
      <div className="min-w-0">
        <div className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-text-muted">{title}</div>
        <div className="mt-1 font-serif text-sm leading-relaxed text-text">{children}</div>
      </div>
    </div>
  );
}

export default function InvitationSection({ invitation }) {
  const date = getDateParts(invitation.date);
  const mapUrl = safeExternalUrl(invitation.mapsUrl);
  const rundown = Array.isArray(invitation.rundown)
    ? invitation.rundown.filter((item) => item && (item.time || item.title || item.note))
    : [];
  const timeLabel = [invitation.startTime, invitation.endTime].filter(Boolean).join(' – ');
  const hasVenue = Boolean(invitation.venueName || invitation.address);
  const hasDressCode = Boolean(invitation.dressCode || invitation.dressCodeNote);
  const hasPrimaryDetails = Boolean(timeLabel || hasVenue || hasDressCode);
  const showCalendar = Boolean(invitation.calendarEnabled && invitation.date);

  return (
    <section className="relative z-10 overflow-hidden px-5 py-20 md:px-8 md:py-28">
      <div
        className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full blur-3xl"
        style={{ background: 'color-mix(in srgb, var(--color-accent) 12%, transparent)' }}
        aria-hidden="true"
      />

      <motion.div
        className="relative mx-auto max-w-[980px]"
        variants={sectionVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.16 }}
      >
        <motion.header variants={itemVariants} className="mx-auto mb-10 max-w-[720px] text-center md:mb-14">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent">
            {invitation.preTitle || 'A little plan for us'}
          </p>
          <h2 className="mt-4 flex flex-col font-serif leading-[0.98] text-text">
            <span className="text-4xl md:text-6xl">{invitation.title1 || "You're Invited"}</span>
            <span className="mt-2 text-5xl italic text-accent md:text-7xl">{invitation.title2 || 'to Celebrate'}</span>
          </h2>
          {invitation.message && (
            <p className="mx-auto mt-6 max-w-[620px] font-serif text-base leading-relaxed text-text-muted md:text-lg">
              {invitation.message}
            </p>
          )}
        </motion.header>

        <div className={`grid gap-5 ${rundown.length > 0 ? 'md:grid-cols-[0.82fr_1.18fr]' : 'mx-auto max-w-[560px]'}`}>
          <motion.article
            variants={itemVariants}
            className="theme-paper-card rounded-[1.5rem] border border-text/10 p-6 text-center md:p-8"
            style={{ background: 'color-mix(in srgb, var(--color-surface) 78%, transparent)' }}
          >
            <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-text-muted">{date.month}</p>
            {date.day ? (
              <p className="my-1 font-serif text-7xl leading-none text-accent md:text-8xl">{date.day}</p>
            ) : (
              <CalendarPlus className="mx-auto my-5 h-12 w-12 text-accent" strokeWidth={1.25} aria-hidden="true" />
            )}
            <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-text">{date.weekday}</p>

            {hasPrimaryDetails && (
              <div className="mt-7 space-y-4">
                <DetailRow icon={Clock3} title="Time">{timeLabel}</DetailRow>
                <DetailRow icon={MapPin} title="Venue">
                  {hasVenue && (
                    <span className="block">
                      {invitation.venueName && <strong className="block font-medium">{invitation.venueName}</strong>}
                      {invitation.address && <span className="mt-0.5 block text-sm text-text-muted">{invitation.address}</span>}
                    </span>
                  )}
                </DetailRow>
                <DetailRow icon={Shirt} title="Dress code">
                  {hasDressCode && (
                    <span className="block">
                      {invitation.dressCode && <strong className="block font-medium">{invitation.dressCode}</strong>}
                      {invitation.dressCodeNote && <span className="mt-0.5 block text-sm text-text-muted">{invitation.dressCodeNote}</span>}
                    </span>
                  )}
                </DetailRow>
              </div>
            )}
          </motion.article>

          {rundown.length > 0 && (
            <motion.article
              variants={itemVariants}
              className="theme-paper-card rounded-[1.5rem] border border-text/10 p-6 md:p-8"
              style={{ background: 'color-mix(in srgb, var(--color-surface) 62%, transparent)' }}
            >
              <p className="font-sans text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-accent">
                {invitation.rundownTitle || 'The evening'}
              </p>
              <ol className="relative mt-6 space-y-0 before:absolute before:bottom-5 before:left-[3.55rem] before:top-2 before:w-px before:bg-accent/25">
                {rundown.map((item, index) => (
                  <li key={`${item.time}-${item.title}-${index}`} className="relative grid grid-cols-[3rem_1fr] gap-6 pb-6 last:pb-0">
                    <time className="pt-0.5 font-sans text-xs font-semibold text-accent">{item.time || '—'}</time>
                    <span className="relative block pl-3 before:absolute before:-left-[0.7rem] before:top-[0.36rem] before:h-2 before:w-2 before:rounded-full before:bg-accent">
                      {item.title && <strong className="block font-serif text-base font-medium text-text">{item.title}</strong>}
                      {item.note && <span className="mt-1 block font-sans text-xs leading-relaxed text-text-muted">{item.note}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </motion.article>
          )}
        </div>

        {invitation.notes && (
          <motion.p variants={itemVariants} className="mx-auto mt-7 flex max-w-[650px] items-start justify-center gap-2 text-center font-serif text-sm italic leading-relaxed text-text-muted">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
            <span>{invitation.notes}</span>
          </motion.p>
        )}

        {(mapUrl || showCalendar) && (
          <motion.div variants={itemVariants} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-sans text-sm font-semibold text-bg transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <Map className="h-4 w-4" aria-hidden="true" />
                {invitation.mapsLabel || 'Open location'}
              </a>
            )}
            {showCalendar && (
              <button
                type="button"
                onClick={() => downloadCalendar(invitation)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-accent/35 bg-transparent px-6 font-sans text-sm font-semibold text-text transition-colors hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <CalendarPlus className="h-4 w-4" aria-hidden="true" />
                {invitation.calendarLabel || 'Add to calendar'}
              </button>
            )}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
