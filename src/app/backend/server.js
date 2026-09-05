const express = require("express")
const mysql = require("mysql2/promise")
const cors = require("cors")
const bcrypt = require("bcrypt")
const { v4: uuidv4 } = require("uuid")

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())

// Configuración de la base de datos
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "123456", // Cambia esto por tu password de MySQL
  database: "skillfinder",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
}

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig)

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Ruta de health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running" })
})

// Rutas de API

// Obtener todos los usuarios
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM users")
    console.log(`Retrieved ${rows.length} users from database`)
    res.json(rows)
  } catch (error) {
    console.error("Error al obtener usuarios:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear nuevo usuario
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password, role, location, phone, description, services } = req.body
    console.log("Creating new user:", { name, email, role, location, phone })

    // Encriptar password
    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = uuidv4()

    // Insertar usuario
    await pool.execute(
      "INSERT INTO users (id, name, email, password, role, location, phone, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [userId, name, email, hashedPassword, role, location, phone, description],
    )

    console.log("User inserted with ID:", userId)

    // Si es profesional, insertar servicios
    if (services && services.length > 0) {
      for (const service of services) {
        await pool.execute("INSERT INTO professional_services (user_id, service_name) VALUES (?, ?)", [userId, service])
      }
      console.log("Services inserted for user:", userId)
    }

    // Insertar ubicación por defecto para profesionales
    if (["gomero", "plomero", "carpintero", "electricista"].includes(role)) {
      await pool.execute(
        "INSERT INTO professional_locations (user_id, latitude, longitude, address) VALUES (?, ?, ?, ?)",
        [userId, -34.6037, -58.3816, location || "Buenos Aires, Argentina"],
      )
      console.log("Location inserted for professional:", userId)
    }

    res.status(201).json({ id: userId, message: "Usuario creado exitosamente" })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "El email ya está registrado" })
    } else {
      res.status(500).json({ error: "Error interno del servidor" })
    }
  }
})

// Obtener profesionales con sus servicios
app.get("/api/professionals", async (req, res) => {
  try {
    const [professionals] = await pool.execute(`
      SELECT u.*, pl.latitude, pl.longitude, pl.address,
             GROUP_CONCAT(ps.service_name) as services
      FROM users u
      LEFT JOIN professional_locations pl ON u.id = pl.user_id
      LEFT JOIN professional_services ps ON u.id = ps.user_id
      WHERE u.role IN ('gomero', 'plomero', 'carpintero', 'electricista')
      GROUP BY u.id
    `)

    console.log(`Retrieved ${professionals.length} professionals from database`)

    // Formatear los datos
    const formattedProfessionals = professionals.map((prof) => ({
      ...prof,
      services: prof.services ? prof.services.split(",") : [],
      location: {
        lat: prof.latitude || -34.6037,
        lon: prof.longitude || -58.3816,
      },
    }))

    res.json(formattedProfessionals)
  } catch (error) {
    console.error("Error al obtener profesionales:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear reserva
app.post("/api/reservations", async (req, res) => {
  try {
    const { professionalId, clientId, date, time, notes } = req.body
    const reservationId = uuidv4()

    await pool.execute(
      "INSERT INTO reservations (id, professional_id, client_id, reservation_date, reservation_time, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [reservationId, professionalId, clientId, date, time, notes],
    )

    res.status(201).json({ id: reservationId, message: "Reserva creada exitosamente" })
  } catch (error) {
    console.error("Error al crear reserva:", error)
    if (error.code === "ER_DUP_ENTRY") {
      res.status(400).json({ error: "Ya existe una reserva para esa fecha y hora" })
    } else {
      res.status(500).json({ error: "Error interno del servidor" })
    }
  }
})

// Obtener reservas
app.get("/api/reservations", async (req, res) => {
  try {
    const [reservations] = await pool.execute(`
      SELECT r.*, 
             p.name as professionalName,
             c.name as clientName
      FROM reservations r
      JOIN users p ON r.professional_id = p.id
      JOIN users c ON r.client_id = c.id
      ORDER BY r.reservation_date DESC, r.reservation_time DESC
    `)

    res.json(reservations)
  } catch (error) {
    console.error("Error al obtener reservas:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Actualizar estado de reserva
app.put("/api/reservations/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    await pool.execute("UPDATE reservations SET status = ? WHERE id = ?", [status, id])

    res.json({ message: "Reserva actualizada exitosamente" })
  } catch (error) {
    console.error("Error al actualizar reserva:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear calificación de profesional
app.post("/api/ratings", async (req, res) => {
  try {
    const { professionalId, clientId, rating, comment } = req.body
    const ratingId = uuidv4()

    await pool.execute(
      "INSERT INTO professional_ratings (id, professional_id, client_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [ratingId, professionalId, clientId, rating, comment],
    )

    res.status(201).json({ id: ratingId, message: "Calificación creada exitosamente" })
  } catch (error) {
    console.error("Error al crear calificación:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Obtener calificaciones
app.get("/api/ratings", async (req, res) => {
  try {
    const [ratings] = await pool.execute(`
      SELECT pr.*, c.name as clientName
      FROM professional_ratings pr
      JOIN users c ON pr.client_id = c.id
      ORDER BY pr.created_at DESC
    `)

    res.json(ratings)
  } catch (error) {
    console.error("Error al obtener calificaciones:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Crear calificación de cliente
app.post("/api/client-ratings", async (req, res) => {
  try {
    const { clientId, professionalId, rating, comment } = req.body
    const ratingId = uuidv4()

    await pool.execute(
      "INSERT INTO client_ratings (id, client_id, professional_id, rating, comment) VALUES (?, ?, ?, ?, ?)",
      [ratingId, clientId, professionalId, rating, comment],
    )

    res.status(201).json({ id: ratingId, message: "Calificación de cliente creada exitosamente" })
  } catch (error) {
    console.error("Error al crear calificación de cliente:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Obtener calificaciones de clientes
app.get("/api/client-ratings", async (req, res) => {
  try {
    const [ratings] = await pool.execute(`
      SELECT cr.*, p.name as professionalName
      FROM client_ratings cr
      JOIN users p ON cr.professional_id = p.id
      ORDER BY cr.created_at DESC
    `)

    res.json(ratings)
  } catch (error) {
    console.error("Error al obtener calificaciones de clientes:", error)
    res.status(500).json({ error: "Error interno del servidor" })
  }
})

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`)
  console.log(`Health check disponible en: http://localhost:${PORT}/api/health`)
})
