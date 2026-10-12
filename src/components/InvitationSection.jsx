'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Clock3, ExternalLink, Map, MapPin, Shirt, X } from 'lucide-react';

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

export default function InvitationSection({ invitation, themeStyles }) {
  const [mapOpen, setMapOpen] = useState(false);
  const mapDialogRef = useRef(null);
  const mapCloseRef = useRef(null);
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
  const hasActions = Boolean(mapUrl || showCalendar);
  const mapQuery = [invitation.venueName, invitation.address].filter(Boolean).join(', ');
  const mapEmbedUrl = mapQuery
    ? `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`
    : '';
  const modalThemeStyles = themeStyles
    ? Object.fromEntries(Object.entries(themeStyles).filter(([key]) => key.startsWith('--')))
    : undefined;

  useEffect(() => {
    if (!mapOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement;
    document.body.style.overflow = 'hidden';
    mapCloseRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMapOpen(false);
        return;
      }
      if (event.key !== 'Tab' || !mapDialogRef.current) return;

      const focusable = [...mapDialogRef.current.querySelectorAll('button, a[href], iframe')]
        .filter((element) => !element.hasAttribute('disabled'));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocused?.focus?.();
    };
  }, [mapOpen]);

  return (
    <section className={`relative z-10 overflow-hidden px-5 pt-20 md:px-8 md:pt-28 ${hasActions ? 'pb-20 md:pb-28' : 'pb-12 md:pb-16'}`}>
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
        <motion.header variants={itemVariants} className="mx-auto mb-7 max-w-[720px] text-center md:mb-10">
          <p className="font-sans text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-accent">
            {invitation.preTitle || 'A little plan for us'}
          </p>
          <h2 className="mt-4 flex flex-col font-serif leading-[0.98] text-text">
            <span className="text-4xl md:text-6xl">{invitation.title1 || "You're Invited"}</span>
            <span className="mt-2 text-5xl italic text-accent md:text-7xl">{invitation.title2 || 'to Celebrate'}</span>
          </h2>
          {invitation.message && (
            <p
              className="mx-auto mt-5 max-w-[590px] font-serif text-base leading-[1.65] text-text-muted md:text-lg"
              style={{ textWrap: 'balance' }}
            >
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
              <ol className="relative mt-6 space-y-0">
                {rundown.length > 1 && (
                  <span
                    className="pointer-events-none absolute bottom-5 left-[3.55rem] top-2 w-px"
                    style={{ background: 'color-mix(in srgb, var(--color-accent) 42%, transparent)' }}
                    aria-hidden="true"
                  />
                )}
                {rundown.map((item, index) => (
                  <li key={`${item.time}-${item.title}-${index}`} className="relative grid grid-cols-[3rem_1fr] gap-6 pb-6 last:pb-0">
                    <time className="pt-0.5 font-sans text-xs font-semibold text-accent">{item.time || '—'}</time>
                    <span
                      className="pointer-events-none absolute left-[3.3rem] top-[0.34rem] z-10 h-2 w-2 rounded-full"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                      aria-hidden="true"
                    />
                    <span className="relative block pl-3">
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
          <motion.div variants={itemVariants} className="mx-auto mt-5 flex max-w-[820px] items-center gap-4 text-center md:mt-6 md:gap-6">
            <span
              className="h-px min-w-6 flex-1"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 38%, transparent)' }}
              aria-hidden="true"
            />
            <p className="max-w-[610px] font-serif text-base italic leading-relaxed text-text-muted md:text-lg">
              {invitation.notes}
            </p>
            <span
              className="h-px min-w-6 flex-1"
              style={{ background: 'color-mix(in srgb, var(--color-accent) 38%, transparent)' }}
              aria-hidden="true"
            />
          </motion.div>
        )}

        {hasActions && (
          <motion.div variants={itemVariants} className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            {mapUrl && (
              <button
                type="button"
                onClick={() => setMapOpen(true)}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-sans text-sm font-semibold text-bg transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              >
                <Map className="h-4 w-4" aria-hidden="true" />
                {invitation.mapsLabel || 'View location'}
              </button>
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

      {mapOpen && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          style={modalThemeStyles}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMapOpen(false);
          }}
        >
          <motion.div
            ref={mapDialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="invitation-map-title"
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-[760px] overflow-hidden rounded-t-[1.5rem] border border-text/15 bg-bg text-text shadow-2xl sm:rounded-[1.5rem]"
          >
            <div className="flex items-start justify-between gap-5 border-b border-text/10 px-5 py-5 sm:px-7">
              <div>
                <p className="font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-accent">Event location</p>
                <h3 id="invitation-map-title" className="mt-1 font-serif text-2xl text-text">
                  {invitation.venueName || 'Location details'}
                </h3>
                {invitation.address && <p className="mt-1 font-sans text-xs leading-relaxed text-text-muted">{invitation.address}</p>}
              </div>
              <button
                ref={mapCloseRef}
                type="button"
                onClick={() => setMapOpen(false)}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-text/15 text-text transition-colors hover:bg-text/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                aria-label="Close location"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {mapEmbedUrl ? (
              <iframe
                src={mapEmbedUrl}
                title={`Map for ${invitation.venueName || invitation.address || 'event location'}`}
                className="h-[52vh] min-h-[320px] w-full border-0 sm:h-[430px]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <MapPin className="h-9 w-9 text-accent" strokeWidth={1.4} aria-hidden="true" />
                <p className="mt-4 max-w-sm font-serif text-base leading-relaxed text-text-muted">
                  Preview peta memerlukan nama tempat atau alamat. Link navigasi tetap tersedia di bawah.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t border-text/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
              <p className="font-sans text-xs text-text-muted">Location opens here first, so the gift stays on screen.</p>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-accent/35 px-5 font-sans text-xs font-semibold text-text transition-colors hover:bg-accent/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Open navigation
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </section>
  );
}
