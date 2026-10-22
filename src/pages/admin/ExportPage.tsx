import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export function ExportPage() {
  const [msg, setMsg] = useState<string | null>(null);

  async function exportBookings(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const from = String(form.get("from"));
    const to = String(form.get("to"));
    const status = String(form.get("status") || "");
    const staffId = String(form.get("staff") || "");

    let q = supabase
      .from("bookings")
      .select(
        "reference, starts_at, ends_at, status, deposit_received, total_price, notes, created_at, clients(full_name, phone, email), staff(full_name), booking_services(name_snapshot, service_id)",
      )
      .gte("starts_at", new Date(from).toISOString())
      .lte("starts_at", new Date(to + "T23:59:59").toISOString())
      .order("starts_at");
    if (status) q = q.eq("status", status);
    if (staffId) q = q.eq("staff_id", staffId);
    const { data, error } = await q;
    if (error) {
      setMsg(error.message);
      return;
    }
    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet("Bookings");
    sheet.columns = [
      { header: "Booking reference", key: "reference", width: 16 },
      { header: "Date", key: "date", width: 14 },
      { header: "Start time", key: "start", width: 12 },
      { header: "End time", key: "end", width: 12 },
      { header: "Client name", key: "name", width: 22 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 24 },
      { header: "Service(s)", key: "services", width: 28 },
      { header: "Staff", key: "staff", width: 18 },
      { header: "Status", key: "status", width: 16 },
      { header: "Deposit received", key: "deposit", width: 16 },
      { header: "Price", key: "price", width: 12 },
      { header: "Notes", key: "notes", width: 24 },
      { header: "Date booked", key: "created", width: 20 },
    ];
    const tz = "Africa/Accra";
    for (const b of data ?? []) {
      const start = new Date(b.starts_at);
      const end = new Date(b.ends_at);
      const client = unwrap(b.clients);
      const staff = unwrap(b.staff);
      const services = ((b.booking_services as { name_snapshot: string }[]) ?? [])
        .map((s) => s.name_snapshot)
        .join("; ");
      const row = sheet.addRow({
        reference: b.reference,
        date: start.toLocaleDateString("en-GB", { timeZone: tz }),
        start: start.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }),
        end: end.toLocaleTimeString("en-GB", { timeZone: tz, hour: "2-digit", minute: "2-digit" }),
        name: client.full_name,
        phone: client.phone,
        email: client.email,
        services,
        staff: staff.full_name,
        status: String(b.status).replace("_", " "),
        deposit: b.deposit_received ? "yes" : "no",
        price: Number(b.total_price),
        notes: b.notes,
        created: new Date(b.created_at).toLocaleString("en-GB", { timeZone: tz }),
      });
      row.getCell("phone").numFmt = "@";
    }

    const byDay = wb.addWorksheet("Per day");
    byDay.columns = [
      { header: "Date", key: "d", width: 14 },
      { header: "Bookings", key: "n", width: 12 },
    ];
    const dayMap = new Map<string, number>();
    for (const b of data ?? []) {
      const d = new Date(b.starts_at).toLocaleDateString("en-GB", { timeZone: tz });
      dayMap.set(d, (dayMap.get(d) ?? 0) + 1);
    }
    for (const [d, n] of dayMap) byDay.addRow({ d, n });

    const byService = wb.addWorksheet("Per service");
    byService.columns = [
      { header: "Service", key: "s", width: 28 },
      { header: "Bookings", key: "n", width: 12 },
    ];
    const svcMap = new Map<string, number>();
    for (const b of data ?? []) {
      for (const s of (b.booking_services as { name_snapshot: string }[]) ?? []) {
        svcMap.set(s.name_snapshot, (svcMap.get(s.name_snapshot) ?? 0) + 1);
      }
    }
    for (const [s, n] of svcMap) byService.addRow({ s, n });

    const byStaff = wb.addWorksheet("Per staff");
    byStaff.columns = [
      { header: "Staff", key: "s", width: 22 },
      { header: "Bookings", key: "n", width: 12 },
    ];
    const staffMap = new Map<string, number>();
    for (const b of data ?? []) {
      const name = unwrap(b.staff).full_name ?? "—";
      staffMap.set(name, (staffMap.get(name) ?? 0) + 1);
    }
    for (const [s, n] of staffMap) byStaff.addRow({ s, n });

    const buf = await wb.xlsx.writeBuffer();
    download(buf, "mielle-lamour-bookings.xlsx");
    setMsg("Downloaded bookings workbook.");
  }

  async function exportClients() {
    const { data, error } = await supabase.from("clients").select("*").order("full_name");
    if (error) {
      setMsg(error.message);
      return;
    }
    const ExcelJS = await import("exceljs");
    const wb = new ExcelJS.Workbook();
    const sheet = wb.addWorksheet("Clients");
    sheet.columns = [
      { header: "Name", key: "name", width: 22 },
      { header: "Phone", key: "phone", width: 16 },
      { header: "Email", key: "email", width: 24 },
      { header: "Notes", key: "notes", width: 24 },
      { header: "No-shows", key: "ns", width: 12 },
    ];
    for (const c of data ?? []) {
      const row = sheet.addRow({
        name: c.full_name,
        phone: c.phone,
        email: c.email,
        notes: c.notes,
        ns: c.no_show_count,
      });
      row.getCell("phone").numFmt = "@";
    }
    const buf = await wb.xlsx.writeBuffer();
    download(buf, "mielle-lamour-clients.xlsx");
    setMsg("Downloaded clients workbook.");
  }

  async function exportCsv() {
    const { data } = await supabase.from("clients").select("full_name,phone,email").order("full_name");
    const lines = ["Name,Phone,Email"];
    for (const c of data ?? []) {
      lines.push(`"${c.full_name}","${c.phone}","${c.email ?? ""}"`);
    }
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    download(await blob.arrayBuffer(), "mielle-lamour-clients.csv");
  }

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-serif text-4xl">Export</h1>
      <form onSubmit={exportBookings} className="card space-y-3 rounded-3xl p-5">
        <h2 className="font-serif text-2xl">Bookings (.xlsx)</h2>
        <label htmlFor="from">From</label>
        <input id="from" name="from" type="date" required />
        <label htmlFor="to">To</label>
        <input id="to" name="to" type="date" required />
        <label htmlFor="status">Status</label>
        <select id="status" name="status">
          <option value="">All</option>
          <option value="confirmed">confirmed</option>
          <option value="pending_deposit">pending deposit</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
          <option value="no_show">no-show</option>
        </select>
        <button className="btn-gold" type="submit">
          Download bookings
        </button>
      </form>
      <button type="button" className="btn-ghost" onClick={exportClients}>
        Download clients
      </button>
      <button type="button" className="btn-ghost" onClick={exportCsv}>
        Clients CSV (UTF-8 BOM)
      </button>
      {msg && <p>{msg}</p>}
    </div>
  );
}

function unwrap(v: unknown): { full_name?: string; phone?: string; email?: string } {
  if (Array.isArray(v)) return v[0] ?? {};
  return (v as { full_name?: string; phone?: string; email?: string }) ?? {};
}

function download(buf: ArrayBuffer, name: string) {
  const blob = new Blob([buf]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}
