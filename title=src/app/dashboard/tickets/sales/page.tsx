  const handleSubmit = () => {
    tickets: Object.entries(passengers).map(([seatId, passenger]) => ({
      schedule_id: selectedSchedule!.id,
      customer_id: customerData ? customerData.id : null,
      bus_seat_id: seatId, // Se usa el UUID
      price: passenger.price,
      notes: `Pasajero: ${passenger.name}, Documento: ${passenger.document_id}`,
    })),
  };

  switch (step) {
    case 6: // Confirmación
      <div key={ticket.bus_seat_id} className="p-4 grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Asiento</p>
          <p className="font-medium">{ticket.bus_seat_id}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Notas</p>
          <p className="font-medium">{ticket.notes}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Precio</p>
          <p className="font-medium">${ticket.price.toFixed(2)}</p>
        </div>
      </div>
  }