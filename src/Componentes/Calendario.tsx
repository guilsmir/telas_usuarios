import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import interactionPlugin from "@fullcalendar/interaction";
import bootstrapPlugin from "@fullcalendar/bootstrap5";
import ptBr from "@fullcalendar/core/locales/pt-br";

interface CalendarioProps {
  onCreate?: () => void;
  selectedPeople?: string[];
  selectedRooms?: string[];
}

export default function Calendario({ onCreate, selectedPeople = [], selectedRooms = [] }: CalendarioProps) {
  const calendarRef = useRef<any>(null);

  const handleDateClick = (info: any) => {
    const api = calendarRef.current?.getApi();
    api?.gotoDate(info.date);
    api?.changeView("timeGridDay");
  };

  const handleChangeView = (viewName: string) => {
    const api = calendarRef.current?.getApi();
    api?.changeView(viewName);
  };

  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin, interactionPlugin, bootstrapPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek,timeGridDay,semester myCustomButton",
      }}
      views={{
        semester: {
          type: "multiMonth",
          duration: { months: 6 },
          buttonText: "Semestre",
        },
      }}
      height="100%"
      selectable={false}
      dateClick={handleDateClick}
      editable={false}
      themeSystem="bootstrap5"
      events={[{ id: "a", title: "my event", start: "2025-09-01" }]}
      weekNumbers={false}
      navLinks={false}
      nowIndicator={true}
      locale={ptBr}
      customButtons={{
        myCustomButton: {
          text: "Criar Reserva",
          click: () => onCreate?.(),
        },
      }}
    />
  );
}