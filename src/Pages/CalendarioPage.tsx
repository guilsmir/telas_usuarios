import { useState, useEffect, useMemo } from "react";
import Calendario from "../Componentes/Calendario";
import ModalReserva from "../Componentes/ModalReserva";
import SidebarFilters from "../Componentes/SidebarFilters";
import type { Person, Room, ReservationData, BackendReservationPayload } from "../Types/api";
import { api } from "../services/api";

interface CalendarioPageProps {
  people: Person[];
  rooms: Room[];
}

export default function CalendarioPage({ people, rooms }: CalendarioPageProps) {
  const [show, setShow] = useState(false);
  const [lastReservation, setLastReservation] = useState<ReservationData | undefined>(undefined);
  const [rawEvents, setRawEvents] = useState<any[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  
  const [currentRange, setCurrentRange] = useState<{start: string, end: string} | null>(null);

  useEffect(() => {
    fetchReservations();
  }, [currentRange]); 

  const filteredEvents = useMemo(() => {
    return rawEvents.filter(event => {
        const salaId = String(event.extendedProps.salaId);
        const passRoom = selectedRoomIds.length === 0 || selectedRoomIds.includes(salaId);
        const userId = String(event.extendedProps.usuarioId);
        const passUser = selectedUserIds.length === 0 || selectedUserIds.includes(userId);

        return passRoom && passUser;
    });
  }, [rawEvents, selectedRoomIds, selectedUserIds]);


  const fetchReservations = async () => {
    try {
      const data = await api.getReservations(currentRange?.start, currentRange?.end);
      
      const mappedEvents = data.map((reserva: any) => ({
        id: String(reserva.id),
        title: reserva.summary || reserva.uso || "Reservado", 
        start: reserva.start?.dateTime || reserva.start?.date,
        end: reserva.end?.dateTime || reserva.end?.date,
        backgroundColor: "#0d6efd", 
        borderColor: "#0a58ca",
        textColor: "#ffffff",
        extendedProps: {
          salaId: reserva.extendedProperties?.private?.fk_sala,
          usuarioId: reserva.extendedProperties?.private?.fk_usuario,
          descricao: reserva.description,
          tipo: reserva.extendedProperties?.private?.tipo
        }
      }));
      setRawEvents(mappedEvents); 
    } catch (error) {
      console.error("Erro ao buscar reservas:", error);
    }
  };

  const handleDatesSet = (dateInfo: any) => {
    setCurrentRange({
        start: dateInfo.startStr,
        end: dateInfo.endStr
    });
  };

  const handleEventClick = (clickInfo: any) => {
    const ev = clickInfo.event;
    const props = ev.extendedProps;
    const owner = people.find(p => String(p.id) === String(props.usuarioId));
    
    const getHHMM = (d: Date) => {
        if(!d) return "00:00";
        return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    };

    const modalData: ReservationData = {
        id: ev.id,
        nome: ev.title,
        email: owner?.email || "", 
        descricao: props.descricao,
        schedules: [{
            roomId: String(props.salaId),
            roomName: "", 
            data: ev.start ? ev.start.toISOString().split('T')[0] : "",
            horaInicio: getHHMM(ev.start),
            horaFim: getHHMM(ev.end || ev.start), 
        }]
    };

    setLastReservation(modalData);
    setShow(true);
  };

  const handleReservationSubmit = async (data: ReservationData | null) => {
    if (!data || !data.schedules || data.schedules.length === 0) return;

    const schedule = data.schedules[0];
    const usuarioEncontrado = people.find(p => p.email === data.email);
    
    if (!usuarioEncontrado) {
      alert("Usuário não encontrado com este email!");
      return;
    }

    const startIso = `${schedule.data}T${schedule.horaInicio}:00`;
    const endIso = `${schedule.data}T${schedule.horaFim}:00`;

    const payloadBackend: BackendReservationPayload = {
      fk_usuario: parseInt(usuarioEncontrado.id),
      fk_sala: parseInt(schedule.roomId),
      dia_horario_inicio: startIso,
      dia_horario_saida: endIso,
      tipo: "Aula",
      uso: data.nome || "Reserva",
      justificativa: data.descricao || "Reserva via App",
      oficio: "N/A",
      // @ts-ignore 
      recurrency: (data as any).recurrency 
    };

    try {
        if (data.id) {
            await api.updateReservation(data.id, payloadBackend);
        } else {
            await api.createReservation(payloadBackend);
        }
        await fetchReservations(); 
        setShow(false);
    } catch (error: any) {
        console.error("Erro no submit:", error);
        alert("Erro ao salvar: " + error.message);
    }
  };

  const handleDeleteReservation = async (id?: string) => {
    if(!id) return;
    if(!window.confirm("Tem certeza que deseja excluir esta reserva?")) return;

    try {
        await api.deleteReservation(id);
        await fetchReservations();
        setShow(false);
    } catch (error) {
        console.error(error);
        alert("Não foi possível excluir a reserva.");
    }
  };

  return (
    <div className="d-flex h-100">
      <ModalReserva
        show={show}
        onClose={() => setShow(false)}
        onSubmit={handleReservationSubmit}
        onDelete={handleDeleteReservation}
        initialData={lastReservation}
        people={people}
        rooms={rooms}
      />
      
      <main className="col p-3 d-flex flex-column flex-grow-1">
         <Calendario 
            onCreate={() => {
                setLastReservation(undefined);
                setShow(true);
            }} 
            events={filteredEvents} 
            datesSet={handleDatesSet}
            onEventClick={handleEventClick} 
         />
      </main>

      <div className="col-12 col-md-4 col-lg-3 border-start p-0" style={{maxWidth: '300px'}}>
        <SidebarFilters 
            people={people}
            rooms={rooms}
            onSelectionChange={(pIds, rIds) => {
                setSelectedUserIds(pIds);
                setSelectedRoomIds(rIds);
            }}
        />
      </div>
    </div>
  );
}