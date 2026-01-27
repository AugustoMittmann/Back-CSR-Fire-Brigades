import express from 'express'
import cors from 'cors'
import brigadesRoutes from './routes/brigades.routes.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/Brigades', brigadesRoutes)

app.listen(process.env.PORT, () => {
  console.log(`🔥 Backend rodando na porta ${process.env.PORT}`)
})
