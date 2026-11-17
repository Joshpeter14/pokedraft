// Server lokal untuk pengembangan: npm run api (port 3000). Di Vercel dipakai api/index.js.
import 'dotenv/config'
import app from './app.js'

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`PokeDraft API jalan di http://localhost:${port}`))
