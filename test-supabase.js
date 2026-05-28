import { supabase } from './src/lib/supabaseClient'; // Ajusta la ruta a donde creaste el cliente

async function probarConexion() {
    const { data, error } = await supabase.from('servicios').select('*').limit(1);
    
    if (error) {
        console.error('❌ Error de conexión:', error.message);
    } else {
        console.log('✅ ¡Conexión exitosa! Datos recibidos:', data);
    }
}

probarConexion();