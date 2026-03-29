import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("Alla");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Inloggning",
  });

  useEffect(() => {
    fetch("http://localhost:5090/api/supporttickets")
      .then((res) => res.json())
      .then((data) => setTickets(data))
      .catch((err) => console.error("Fel vid hämtning av tickets:", err));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!formData.title.trim() || !formData.description.trim()) {
      alert("Fyll i titel och beskrivning.");
      return;
    }

    const newTicket = {
      title: formData.title,
      description: formData.description,
      status: "Open",
      category: formData.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    fetch("http://localhost:5090/api/supporttickets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newTicket),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Kunde inte skapa ticket.");
        }
        return res.json();
      })
      .then((createdTicket) => {
        setTickets((prev) => [createdTicket, ...prev]);
        setFormData({
          title: "",
          description: "",
          category: "Inloggning",
        });
      })
      .catch((err) => console.error("Fel vid skapande av ticket:", err));
  }

  function deleteTicket(id) {
    fetch(`http://localhost:5090/api/supporttickets/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Kunde inte ta bort ticket.");
        }

        setTickets((prev) => prev.filter((ticket) => ticket.id !== id));
      })
      .catch((err) => console.error("Fel vid borttagning av ticket:", err));
  }

  function updateStatus(id, newStatus) {
    const ticketToUpdate = tickets.find((ticket) => ticket.id === id);

    if (!ticketToUpdate) return;

    const updatedTicket = {
      ...ticketToUpdate,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    fetch(`http://localhost:5090/api/supporttickets/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedTicket),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Kunde inte uppdatera status.");
        }

        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === id
              ? { ...ticket, status: newStatus, updatedAt: updatedTicket.updatedAt }
              : ticket
          )
        );
      })
      .catch((err) => console.error("Fel vid uppdatering av status:", err));
  }

  const filteredTickets =
    filter === "Alla"
      ? tickets
      : tickets.filter((ticket) => ticket.status === filter);

  return (
    <div className="app">
      <header className="header">
        <h1>Supportsystem</h1>
        <p>Hantera tekniska problem från elever, lärare och administratörer.</p>
      </header>

      <section className="form-section">
        <h2>Skapa nytt supportärende</h2>

        <form onSubmit={handleSubmit} className="ticket-form">
          <input
            type="text"
            name="title"
            placeholder="Titel på problemet"
            value={formData.title}
            onChange={handleChange}
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="Inloggning">Inloggning</option>
            <option value="Utrustning">Utrustning</option>
            <option value="Nätverk">Nätverk</option>
            <option value="Programvara">Programvara</option>
            <option value="Annat">Annat</option>
          </select>

          <textarea
            name="description"
            placeholder="Beskriv problemet"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          ></textarea>

          <button type="submit">Skicka in ticket</button>
        </form>
      </section>

      <section className="filter-section">
        <h2>Supportärenden</h2>

        <div className="filter-buttons">
          <button onClick={() => setFilter("Alla")}>Alla</button>
          <button onClick={() => setFilter("Open")}>Öppna</button>
          <button onClick={() => setFilter("In Progress")}>Pågående</button>
          <button onClick={() => setFilter("Solved")}>Lösta</button>
        </div>
      </section>

      <section className="ticket-list">
        {filteredTickets.length === 0 ? (
          <p>Inga tickets hittades.</p>
        ) : (
          filteredTickets.map((ticket, index) => (
            <div className="ticket-card" key={ticket.id || index}>
              <div className="ticket-top">
                <h3>{ticket.title || "Ingen titel"}</h3>
                <span className="status">
                  {ticket.status || "Okänd status"}
                </span>
              </div>

              <p>{ticket.description || "Ingen beskrivning"}</p>

              <div className="ticket-info">
                <p><strong>Kategori:</strong> {ticket.category || "Okänd"}</p>
                <p>
                  <strong>Skapad:</strong>{" "}
                  {ticket.createdAt
                    ? new Date(ticket.createdAt).toLocaleString()
                    : "Okänd"}
                </p>
                <p>
                  <strong>Senast uppdaterad:</strong>{" "}
                  {ticket.updatedAt
                    ? new Date(ticket.updatedAt).toLocaleString()
                    : "Okänd"}
                </p>
              </div>

              <div className="ticket-actions">
                <button onClick={() => updateStatus(ticket.id, "Open")}>
                  Sätt som öppen
                </button>
                <button onClick={() => updateStatus(ticket.id, "In Progress")}>
                  Sätt som pågående
                </button>
                <button onClick={() => updateStatus(ticket.id, "Solved")}>
                  Markera som löst
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteTicket(ticket.id)}
                >
                  Ta bort
                </button>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;