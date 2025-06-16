import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
//import dataservice
import cityRoutes from './routes/cityRoutes'

dotenv.config()

const app = express()
const port = process.env.PORT || 3000
//data servvice

app.use(cors())
app.use(express.json())


//add other app enpoint below
app.use('/search', cityRoutes)

app.get('/health', (req, res) => {
    res.json({status: 'OK', timestamp: new Date().toISOString()})
})

//running the server
app.listen(port, () => {
    console.log(`app is listening on port ${port}`)
})

export default app