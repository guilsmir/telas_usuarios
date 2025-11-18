// src/Componentes/Calendario.tsx
import { useRef, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap5";
import ptBr from "@fullcalendar/core/locales/pt-br";

interface CalendarioProps {
  onCreate?: () => void;
  selectedPeople?: string[];
  selectedRooms?: string[];
  onEventClick?: (reservationWithId?: any) => void;
  updatedEvent?: any | null;
  deletedEventId?: string | null;
}

const initialEvents = [
  {
    id: "e1",
    title: "Reunião - Sala 101",
    start: "2025-11-18T09:00:00",
    end: "2025-11-18T10:30:00",
    color: "#3A86FF",
    extendedProps: {
      reservation: {
        nome: "Reunião",
        email: "pessoa@u.edu",
        descricao: "Discussão",
        schedules: [
          {
            id: "s1",
            roomId: "r1",
            roomName: "Sala 101",
            data: "2025-11-18",
            horaInicio: "09:00",
            horaFim: "10:30",
          },
        ],
      },
    },
  },
  {
    id: "e2",
    title: "Aula - Auditório",
    start: "2025-11-19T14:00:00",
    end: "2025-11-19T16:00:00",
    color: "#FF9F1C",
    extendedProps: {
      reservation: {
        nome: "Aula",
        email: "prof@u.edu",
        descricao: "Seminário",
        schedules: [
          {
            id: "s2",
            roomId: "r2",
            roomName: "Auditório",
            data: "2025-11-19",
            horaInicio: "14:00",
            horaFim: "16:00",
          },
        ],
      },
    },
  },
];

export default function Calendario({
  onCreate,
  selectedPeople = [],
  selectedRooms = [],
  onEventClick,
  updatedEvent,
  deletedEventId,
}: CalendarioProps) {
  const calendarRef = useRef<FullCalendar | null>(null);

  const handleEventMouseEnter = (mouseEnterInfo: any) => {
    try {
      const el = mouseEnterInfo.el as HTMLElement;
      if (el) el.style.cursor = "pointer";
      if (el) el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
    } catch (e) {
      // ignore
    }
  };

  const handleEventMouseLeave = (mouseLeaveInfo: any) => {
    try {
      const el = mouseLeaveInfo.el as HTMLElement;
      if (el) el.style.cursor = "";
      if (el) el.style.boxShadow = "";
    } catch (e) {
      // ignore
    }
  };

  const handleEventClick = (clickInfo: any) => {
    const ev = clickInfo.event;
    const reservation =
      ev.extendedProps && ev.extendedProps.reservation
        ? ev.extendedProps.reservation
        : null;
    const maybeSchedule = reservation?.schedules?.[0] ?? {
      data: ev.start ? ev.start.toISOString().split("T")[0] : undefined,
      horaInicio: ev.start ? ev.start.toTimeString().slice(0, 5) : undefined,
      horaFim: ev.end ? ev.end.toTimeString().slice(0, 5) : undefined,
      roomName: ev.title ?? "",
      roomId: undefined,
      id: undefined,
      recorrencia: "nao",
      intervaloRecorrencia: 1,
      unidadeRecorrencia: "dias",
      diasSemana: [],
      recurrenceEnd: "never",
      occurrences: 1,
      recurrenceEndDate: "",
    };

    const payload = {
      id: ev.id,
      nome: reservation?.nome ?? ev.title,
      email: reservation?.email ?? "",
      descricao: reservation?.descricao ?? "",
      schedules: reservation?.schedules ?? [maybeSchedule],
      _rawExtendedProps: ev.extendedProps,
    };

    onEventClick?.(payload);
  };

  // dateClick: change to day view of the clicked date
  const handleDateClick = (arg: any) => {
    try {
      const calApi = (calendarRef.current as any)?.getApi?.();
      if (!calApi) return;
      calApi.changeView("timeGridDay", arg.dateStr);
    } catch (e) {
      console.warn("dateClick handler failed:", e);
    }
  };

  useEffect(() => {
    if (!updatedEvent) return;
    const calApi = (calendarRef.current as any)?.getApi?.();
    if (!calApi) return;
    const ev = calApi.getEventById(updatedEvent.id);
    if (ev) {
      if (updatedEvent.title !== undefined)
        ev.setProp("title", updatedEvent.title);
      if (updatedEvent.start !== undefined) ev.setStart(updatedEvent.start);
      if (updatedEvent.end !== undefined) ev.setEnd(updatedEvent.end);
      if (updatedEvent.color !== undefined)
        ev.setProp("backgroundColor", updatedEvent.color);
      if (
        updatedEvent.extendedProps &&
        updatedEvent.extendedProps.reservation !== undefined
      ) {
        ev.setExtendedProp(
          "reservation",
          updatedEvent.extendedProps.reservation
        );
      }
    } else {
      try {
        calApi.addEvent(updatedEvent);
      } catch (e) {
        console.warn("Falha ao atualizar/adicionar evento:", e);
      }
    }
  }, [updatedEvent]);

  useEffect(() => {
    if (!deletedEventId) return;
    const calApi = (calendarRef.current as any)?.getApi?.();
    if (!calApi) return;
    const ev = calApi.getEventById(deletedEventId);
    if (ev) ev.remove();
  }, [deletedEventId]);

  // CSS injection: today highlight (square), now indicator, and invisible scrollbars across FC scrollers
  useEffect(() => {
    const id = "calendario-custom-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      /* TODAY highlight - square border (no rounded corners) */
      .fc .fc-daygrid-day.fc-day-today {
        background-color: rgba(13,110,253,0.06) !important;
        box-shadow: inset 0 0 0 2px rgba(13,110,253,0.12);
        border-radius: 0 !important;
      }
      .fc .fc-multimonth-day-frame .fc-daygrid-day.fc-day-today,
      .fc .fc-multimonth-day-frame .fc-daygrid-day.fc-day-today .fc-daygrid-day-top {
        box-shadow: inset 0 0 0 2px rgba(13,110,253,0.12);
        background-color: rgba(13,110,253,0.05) !important;
        border-radius: 0 !important;
      }
      .fc .fc-col-header-cell.fc-day-today {
        background-color: rgba(13,110,253,0.06) !important;
      }
      .fc .fc-timegrid-col.fc-day-today {
        background-color: rgba(13,110,253,0.03);
      }

      /* now indicator uses bootstrap primary */
      .fc .fc-now-indicator { background: #0d6efd !important; }

      /* subtle hover effect on events */
      .fc .fc-event, .fc .fc-daygrid-event {
        transition: box-shadow 120ms ease, transform 120ms ease;
      }
      .fc .fc-event:hover, .fc .fc-daygrid-event:hover {
        transform: translateY(-1px);
      }

      /* invisible scrollbars for all FC scrollers (webkit + firefox + IE/Edge) */
      .fc .fc-scroller, .fc .fc-daygrid, .fc .fc-daygrid-body, .fc .fc-list, .fc .fc-list-table, .fc .fc-list-day {
        -ms-overflow-style: none !important;
        scrollbar-width: none !important;
      }
      .fc .fc-scroller::-webkit-scrollbar, .fc .fc-daygrid::-webkit-scrollbar, .fc .fc-daygrid-body::-webkit-scrollbar, .fc .fc-list::-webkit-scrollbar, .fc .fc-list-table::-webkit-scrollbar {
        display: none !important;
        width: 0 !important;
        height: 0 !important;
      }

      /* ensure pointer fallback for events */
      .fc .fc-event, .fc .fc-daygrid-event { cursor: pointer; }
    `;
    document.head.appendChild(style);
  }, []);

  return (
    <>
      <FullCalendar
        ref={calendarRef}
        plugins={[
          dayGridPlugin,
          timeGridPlugin,
          multiMonthPlugin,
          listPlugin,
          interactionPlugin,
          bootstrapPlugin,
        ]}
        themeSystem="bootstrap5"
        initialView="dayGridMonth"
        locales={[ptBr]}
        locale="pt-br"
        events={initialEvents}
        headerToolbar={{
          left: "prev,next today createReserve",
          center: "title",
          right:
            "dayGridMonth,timeGridWeek,timeGridDay,listMonth,semesterButton",
        }}
        customButtons={{
          createReserve: {
            text: "Criar Reserva",
            click: () => {
              if (typeof onCreate === "function") onCreate();
              else {
                // fallback: try to open day view on today
                const calApi = (calendarRef.current as any)?.getApi?.();
                calApi?.changeView?.("timeGridDay");
              }
            },
          },
          semesterButton: {
            text: "Semestre",
            click: () => {
              const calApi = (calendarRef.current as any)?.getApi?.();
              if (!calApi) return;
              try {
                calApi.changeView("semester");
              } catch (e) {
                calApi.changeView("multiMonth", { duration: { months: 6 } });
              }
            },
          },
        }}
        views={{
          semester: {
            type: "multiMonth",
            duration: { months: 6 },
            buttonText: "Semestre",
            multiMonthMaxColumns: 3,
          },
        }}
        editable={false}
        selectable={true}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        eventMouseEnter={handleEventMouseEnter}
        eventMouseLeave={handleEventMouseLeave}
        navLinks={true}
        nowIndicator={true}
        /* make calendar occupy almost full viewport height */
        height="calc(100vh - 96px)"
        contentHeight="auto"
      />
    </>
  );
}
