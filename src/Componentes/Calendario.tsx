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
  events?: any[]; 
  datesSet?: (arg: any) => void;
  onEventClick?: (payload: any) => void;
}

export default function Calendario({
  onCreate,
  events = [], 
  datesSet,
  onEventClick, 
}: CalendarioProps) {
  
  const handleEventClickInternal = (clickInfo: any) => {
     clickInfo.jsEvent.preventDefault();
     
     if (onEventClick) {
         onEventClick(clickInfo);
     }
  };

  return (
    <div className="h-100">
        <style>
            {`
                /* Força o cursor a virar mãozinha nos eventos */
                .fc-event {
                    cursor: pointer !important;
                }
                /* Ajuste para visão semestral caber melhor */
                .fc-multimonth-month {
                    padding: 10px;
                }
            `}
        </style>
        <FullCalendar
        plugins={[
            dayGridPlugin, 
            timeGridPlugin, 
            multiMonthPlugin, 
            listPlugin, 
            interactionPlugin, 
            bootstrapPlugin
        ]}
        themeSystem="bootstrap5"
        initialView="dayGridMonth"
        locale={ptBr}
        headerToolbar={{
            left: "prev,next today createReserve",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay,semester,listWeek"
        }}
        views={{
            semester: {
                type: 'multiMonthYear',
                duration: { months: 6 },
                buttonText: 'Semestre',
                multiMonthMaxColumns: 3
            }
        }}
        customButtons={{
            createReserve: {
            text: "Nova Reserva",
            click: () => onCreate?.(),
            hint: "Criar nova reserva"
            }
        }}
        events={events}
        datesSet={datesSet}
        editable={false} 
        selectable={true} 
        dayMaxEvents={true} 
        eventClick={handleEventClickInternal}
        height="100%"
        />
    </div>
  );
}