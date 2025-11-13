import React, { useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import listPlugin from '@fullcalendar/list';
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

  // RESTORED: Function to apply 'selected-day' class ONLY to the current day
  const getCurrentDayClassNames = (arg: { date: Date, isToday: boolean, view: any }) => {
    // Check if the current cell is the actual current day
    if (arg.isToday) {
      return ['selected-day']; // Class defined in App.css for light blue background
    }
    return [];
  };

  const handleChangeView = (viewName: string) => {
    const api = calendarRef.current?.getApi();
    api?.changeView(viewName);
  };
  
  return (
    <FullCalendar
      ref={calendarRef}
      plugins={[dayGridPlugin, timeGridPlugin, multiMonthPlugin, listPlugin, interactionPlugin, bootstrapPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "timeGridDay,timeGridWeek,dayGridMonth,semester,listMonth myCustomButton",
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
      // RESTORED: This line applies the class, which is colored in App.css
      dayCellClassNames={getCurrentDayClassNames}
      nowIndicator={true} // Keeps the blue "now" indicator line
      locale={ptBr}
      events={
        [
  { id: 'e1',  title: 'Reunião - Sala 101 (Ana Silva)', start: '2025-10-02T09:00:00', end: '2025-10-02T10:00:00', color: '#FF6B6B' },
  { id: 'e2',  title: 'Treinamento TI - Sala 202', start: '2025-10-03T14:00:00', end: '2025-10-03T17:00:00', color: '#6BCB77' },
  { id: 'e3',  title: 'Entrevista - Sala 103 (Bruno Costa)', start: '2025-10-06T11:00:00', end: '2025-10-06T11:45:00', color: '#4D96FF' },
  { id: 'e4',  title: 'Planejamento - Sala 201', start: '2025-10-07T13:30:00', end: '2025-10-07T15:00:00', color: '#FFD93D' },
  { id: 'e5',  title: 'Revisão Projeto - Sala 301', start: '2025-10-09T10:00:00', end: '2025-10-09T12:00:00', color: '#9B5DE5' },
  { id: 'e6',  title: 'Workshop Design - Auditório', start: '2025-10-11T08:30:00', end: '2025-10-11T12:30:00', color: '#00C2A8' },
  { id: 'e7',  title: 'One-on-One - Sala 102 (Carla Dias)', start: '2025-10-14T16:00:00', end: '2025-10-14T16:30:00', color: '#FF8FAB' },
  { id: 'e8',  title: 'Reunião Comissão - Sala 103', start: '2025-10-15T09:00:00', end: '2025-10-15T11:00:00', color: '#2EC4B6' },
  { id: 'e9',  title: 'Demo Cliente - Sala 201', start: '2025-10-17T15:00:00', end: '2025-10-17T16:30:00', color: '#7C4DFF' },
  { id: 'e10', title: 'All-hands Mensal - Auditório (Todos)', start: '2025-10-20T10:00:00', end: '2025-10-20T12:00:00', color: '#FFA500' },

  { id: 'e11', title: 'Reunião Estratégica - Sala 101 (Felipe Rocha)', start: '2025-10-22T14:00:00', end: '2025-10-22T16:00:00', color: '#1E90FF' },
  { id: 'e12', title: 'Sessão de Feedback - Sala 102', start: '2025-10-23T09:30:00', end: '2025-10-23T10:30:00', color: '#FFB4A2' },
  { id: 'e13', title: 'Instalação de Equipamento - Sala 204', start: '2025-10-24T18:00:00', end: '2025-10-24T20:00:00', color: '#00A8E8' },
  { id: 'e14', title: 'Reunião Comitê de Risco - Sala 301', start: '2025-10-28T11:00:00', end: '2025-10-28T12:30:00', color: '#C77DFF' },
  { id: 'e15', title: 'Treinamento Vendas - Sala 202', start: '2025-10-30T09:00:00', end: '2025-10-30T12:00:00', color: '#52B788' },

  { id: 'e16', title: 'Kickoff Sprint - Sala 101', start: '2025-11-03T09:00:00', end: '2025-11-03T10:30:00', color: '#F94144' },
  { id: 'e17', title: 'Reunião com Parceiros - Sala 201', start: '2025-11-05T14:00:00', end: '2025-11-05T15:30:00', color: '#90BE6D' },
  { id: 'e18', title: 'Entregáveis - Sala 103', start: '2025-11-07T10:00:00', end: '2025-11-07T11:00:00', color: '#577590' },
  { id: 'e19', title: 'Hackathon (Início) - Sala Multiuso', start: '2025-11-08T09:00:00', end: '2025-11-09T18:00:00', color: '#F8961E' },
  { id: 'e20', title: 'Reunião RH - Sala 102 (Fernanda Oliveira)', start: '2025-11-11T15:00:00', end: '2025-11-11T16:00:00', color: '#5E60CE' },

  { id: 'e21', title: 'Apresentação Projeto - Sala 301', start: '2025-11-13T13:30:00', end: '2025-11-13T15:00:00', color: '#43AA8B' },
  { id: 'e22', title: 'Atualização Semanal - Sala 202', start: '2025-11-17T10:00:00', end: '2025-11-17T10:30:00', color: '#EF476F' },
  { id: 'e23', title: 'Visita Técnica - Sala 204', start: '2025-11-18T08:30:00', end: '2025-11-18T12:30:00', color: '#119DA4' },
  { id: 'e24', title: 'Reunião Financeira - Sala 101 (André Gonçalves)', start: '2025-11-20T14:00:00', end: '2025-11-20T15:30:00', color: '#FFD166' },
  { id: 'e25', title: 'Sessão de Treinamento - Auditório', start: '2025-11-24T09:00:00', end: '2025-11-24T17:00:00', color: '#8ECAE6' },

  { id: 'e26', title: 'Encerramento Hackathon - Sala Multiuso', start: '2025-12-01T09:00:00', end: '2025-12-01T13:00:00', color: '#E05A6A' },
  { id: 'e27', title: 'Revisão Anual - Sala 301', start: '2025-12-03T11:00:00', end: '2025-12-03T13:00:00', color: '#7F7FD5' },
  { id: 'e28', title: 'Alinhamento Marketing - Sala 202 (Beatriz Mendes)', start: '2025-12-09T15:00:00', end: '2025-12-09T16:30:00', color: '#6EE7B7' },
  { id: 'e29', title: 'Festa de Fim de Ano - Auditório (Todos)', start: '2025-12-19T19:00:00', end: '2025-12-19T23:00:00', color: '#FF9F1C' },
  { id: 'e30', title: 'Fechamento Financeiro - Sala 101', start: '2025-12-29T09:00:00', end: '2025-12-29T12:00:00', color: '#3A86FF' }
]
      }
      weekNumbers={false}
      navLinks={false}
      customButtons={{
        myCustomButton: {
          text: "Criar Reserva",
          click: () => onCreate?.(),
        },
      }}
    />
  );
}