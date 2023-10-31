import { FC, useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import AddEventModal from "./AddEventModal";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { EventClickArg, EventSourceInput } from "@fullcalendar/core/index.js";
import EventModal from "./EventModal";

const handleEventContent: FC<EventContentProps> = (eventInfo): JSX.Element => {
  return (
    <div
      className={`px-1 w-full rounded-sm text-white cursor-pointer`}
      style={{
        backgroundColor: eventInfo.backgroundColor,
      }}
    >
      <i>{eventInfo.event.title}</i>
    </div>
  );
};

const Calendar: FC = (): JSX.Element => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [bookingsData, setBookingsData] = useState<BookingDataProps[]>();
  const [eventInfo, setEventInfo] = useState<EventInfoProps>({
    title: "",
    purpose: "",
    start: "",
    end: "",
    date: "",
    requestBy: "",
  });

  const { data, isPending } = useQuery<BookingDataProps[]>({
    queryKey: ["bookings"],
    queryFn: async () => {
      const response = await axios.get<BookingDataProps[]>(
        "http://localhost:3000/facility/facility-1",
        {
          withCredentials: true,
        }
      );
      return response.data;
    },
  });

  useEffect(() => {
    if (!isPending) {
      const newData = data?.map((booking) => {
        return { ...booking, id: booking.id.toString() };
      });
      setBookingsData(newData || []);
    }
  }, [data, isPending]);

  const handleEventClick = (info: EventClickArg): void => {
    console.log(info);
    console.log(info.event._def);
    setEventInfo({
      title: info.event._def.title,
      purpose: info.event._def.extendedProps.purpose,
      start: info.event._instance!.range.start.toLocaleString().slice(11, 22),
      end: info.event._instance!.range.end.toLocaleString().slice(11, 22),
      date: info.event._instance!.range.start.toDateString(),
      requestBy: info.event._def.extendedProps.requestedBy.name,
    });
    setIsOpen(true);
  };

  return (
    <div className="w-[80%] h-full flex flex-col items-center justify-center text-black px-6 pt-12">
      {isAddOpen && (
        <AddEventModal isOpen={isAddOpen} setIsOpen={setIsAddOpen} />
      )}
      {isOpen && (
        <EventModal
          isOpen={isOpen}
          setIsOpen={setIsOpen}
          eventInfo={eventInfo}
        />
      )}
      <h1 className="uppercase">CALENDER</h1>
      <div className="w-[90%]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={bookingsData as EventSourceInput}
          headerToolbar={{
            left: "prev,next,today,addEventButton",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          eventContent={() => handleEventContent}
          eventClick={(info) => {
            handleEventClick(info);
          }}
          customButtons={{
            addEventButton: {
              text: "Add event",
              click: () => setIsAddOpen(true),
            },
          }}
        />
      </div>
    </div>
  );
};

export default Calendar;
