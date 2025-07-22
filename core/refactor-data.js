import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import crypto from 'crypto'

// Configuración de Supabase
const supabaseUrl = 'https://cyeyaroruzmwcfhijhxs.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZXlhcm9ydXptd2NmaGlqaHhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDU2MTEsImV4cCI6MjA2Njg4MTYxMX0.dv-E2nW59MoFu31m9dtz4U8YU9PwK2S6D9hc5Jz7DS8'
const supabase = createClient(supabaseUrl, supabaseKey)

// ===============================
// 1. SCRIPT PARA VACIAR TABLAS
// ===============================

async function clearAllTables() {
  try {
    console.log('🗑️  VACIANDO TODAS LAS TABLAS...')
    console.log('⚠️  ADVERTENCIA: Esto eliminará TODOS los datos')
    console.log('Presiona Ctrl+C para cancelar o espera 10 segundos para continuar...')
    
    await new Promise(resolve => setTimeout(resolve, 10000))
    
    // Eliminar en orden inverso debido a las foreign keys
    console.log('Eliminando exercise_sets...')
    const { error: exerciseSetsError } = await supabase
      .from('exercise_sets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (exerciseSetsError) console.error('Error eliminando sets:', exerciseSetsError)
    
    console.log('Eliminando exercises...')
    const { error: exercisesError } = await supabase
      .from('exercises')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (exercisesError) console.error('Error eliminando exercises:', exercisesError)
    
    console.log('Eliminando sessions...')
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (sessionsError) console.error('Error eliminando sessions:', sessionsError)
    
    console.log('Eliminando session_exercises...')
    const { error: sessionExercisesError } = await supabase
      .from('session_exercises')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (sessionExercisesError) console.error('Error eliminando session_exercises:', sessionExercisesError)
    
    console.log('Eliminando weeks...')
    const { error: weeksError } = await supabase
      .from('weeks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (weeksError) console.error('Error eliminando weeks:', weeksError)
    
    console.log('Eliminando sets...')
    const { error: setsError } = await supabase
      .from('sets')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (setsError) console.error('Error eliminando sets:', setsError)
    
    console.log('Eliminando guides...')
    const { error: guidesError } = await supabase
      .from('guides')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
    
    if (guidesError) console.error('Error eliminando guides:', guidesError)
    
    console.log('✅ Todas las tablas han sido vaciadas')
    
  } catch (error) {
    console.error('Error vaciando tablas:', error)
  }
}

// ===============================
// 2. ANALIZADOR Y DIVISOR DE DATOS
// ===============================

// Función para generar hash único de ejercicio
function generateExerciseHash(exercise) {
  const hashData = {
    title: exercise.title?.trim().toLowerCase(),
    video_url: exercise.video_url?.trim()
  }
  return crypto.createHash('md5').update(JSON.stringify(hashData)).digest('hex')
}

// Función para generar hash único de serie
function generateSetHash(set) {
  const hashData = {
    set_series: set.set_series?.trim(),
    set_reps: set.set_reps?.trim(),
    set_rest: set.set_rest?.trim()
  }
  return crypto.createHash('md5').update(JSON.stringify(hashData)).digest('hex')
}

// Función principal para dividir y optimizar datos
const uuidv4 = () => crypto.randomUUID();

async function optimizeAndDivideGuideData(inputFilePath, outputDir = './core/optimized_data_2') {
  try {
    console.log('📊 ANALIZANDO Y DIVIDIENDO DATOS...')
    
    // Crear directorio de salida
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }
    
    // Leer datos originales
    console.log('Leyendo archivo original...')
    const originalData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'))
    
    // Estructuras para datos optimizados
    const guides = []
    const weeks = []
    const sessions = []
    const uniqueExercises = new Map() // Para eliminar duplicados
    const uniqueSets = new Map() // Para eliminar duplicados
    const sessionExercises = [] // Tabla pivot session-exercise
    const exerciseSets = [] // Relación exercise-set
    
    console.log(`Procesando ${originalData.length} guías...`)
    
    // Procesar cada guía
    for (let guideIndex = 0; guideIndex < originalData.length; guideIndex++) {
      const guide = originalData[guideIndex]
      
      if (guideIndex % 10 === 0) {
        console.log(`Procesando guía ${guideIndex + 1}/${originalData.length}`)
      }
      
      // 1. Procesar guía
      const guideId = uuidv4()
      guides.push({
        id: guideId,
        original_id: guide.id,
        title: guide.title,
        link: guide.link,
        image_url: guide.image
      })
      
      // 2. Procesar semanas
      if (guide.weeks) {
        for (let weekIndex = 0; weekIndex < guide.weeks.length; weekIndex++) {
          const week = guide.weeks[weekIndex]
          const weekId = uuidv4()
          
          weeks.push({
            id: weekId,
            guide_id: guideId,
            week_title: week.week_title,
            week_link: week.week_link,
            week_index: week.week_index
          })
          
          // 3. Procesar sesiones/días
          if (week.days) {
            for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
              const day = week.days[dayIndex]
              const sessionId = uuidv4()
              
              sessions.push({
                id: sessionId,
                week_id: weekId,
                day_number: day.day_number,
                title: day.title,
                link: day.link
              })
              
              // 4. Procesar ejercicios
              if (day.exercises) {
                for (let exerciseIndex = 0; exerciseIndex < day.exercises.length; exerciseIndex++) {
                  const exercise = day.exercises[exerciseIndex]
                  const exerciseHash = generateExerciseHash(exercise)
                  
                  // Solo agregar ejercicio si no existe
                  if (!uniqueExercises.has(exerciseHash)) {
                    uniqueExercises.set(exerciseHash, {
                      id: uuidv4(),
                      hash: exerciseHash,
                      title: exercise.title,
                      video_url: exercise.video_url,
                      usage_count: 0
                    })
                  }
                  
                  // Incrementar contador de uso
                  uniqueExercises.get(exerciseHash).usage_count++
                  
                  // Crear relación session-exercise
                  sessionExercises.push({
                    id: uuidv4(),
                    session_id: sessionId,
                    exercise_id: uniqueExercises.get(exerciseHash).id,
                    order_in_session: exerciseIndex + 1
                  })
                  
                  // 5. Procesar series
                  if (exercise.sets) {
                    for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
                      const set = exercise.sets[setIndex]
                      const setHash = generateSetHash(set)
                      
                      // Solo agregar serie si no existe
                      if (!uniqueSets.has(setHash)) {
                        uniqueSets.set(setHash, {
                          id: uuidv4(),
                          hash: setHash,
                          set_series: set.set_series,
                          set_reps: set.set_reps,
                          set_rest: set.set_rest,
                          usage_count: 0
                        })
                      }
                      
                      // Incrementar contador de uso
                      uniqueSets.get(setHash).usage_count++
                      
                      // Crear relación exercise-set
                      exerciseSets.push({
                        id: uuidv4(),
                        session_id: sessionId,
                        exercise_id: uniqueExercises.get(exerciseHash).id,
                        set_id: uniqueSets.get(setHash).id,
                        order_in_exercise: setIndex + 1
                      })
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    // Convertir Maps a arrays
    const exercisesArray = Array.from(uniqueExercises.values())
    const setsArray = Array.from(uniqueSets.values())
    
    // Mostrar estadísticas
    console.log('\n📈 ESTADÍSTICAS DE OPTIMIZACIÓN:')
    console.log(`✅ Guías: ${guides.length}`)
    console.log(`✅ Semanas: ${weeks.length}`)
    console.log(`✅ Sesiones: ${sessions.length}`)
    console.log(`✅ Ejercicios únicos: ${exercisesArray.length}`)
    console.log(`✅ Series únicas: ${setsArray.length}`)
    console.log(`✅ Relaciones sesión-ejercicio: ${sessionExercises.length}`)
    console.log(`✅ Relaciones ejercicio-serie: ${exerciseSets.length}`)
    
    // Guardar archivos optimizados
    console.log('\n💾 GUARDANDO ARCHIVOS OPTIMIZADOS...')
    
    fs.writeFileSync(`${outputDir}/guides.json`, JSON.stringify(guides, null, 2))
    console.log(`✅ Guardado: guides.json`)
    
    fs.writeFileSync(`${outputDir}/weeks.json`, JSON.stringify(weeks, null, 2))
    console.log(`✅ Guardado: weeks.json`)
    
    fs.writeFileSync(`${outputDir}/sessions.json`, JSON.stringify(sessions, null, 2))
    console.log(`✅ Guardado: sessions.json`)
    
    fs.writeFileSync(`${outputDir}/exercises.json`, JSON.stringify(exercisesArray, null, 2))
    console.log(`✅ Guardado: exercises.json`)
    
    fs.writeFileSync(`${outputDir}/sets.json`, JSON.stringify(setsArray, null, 2))
    console.log(`✅ Guardado: sets.json`)
    
    fs.writeFileSync(`${outputDir}/session_exercises.json`, JSON.stringify(sessionExercises, null, 2))
    console.log(`✅ Guardado: session_exercises.json`)
    
    fs.writeFileSync(`${outputDir}/exercise_sets.json`, JSON.stringify(exerciseSets, null, 2))
    console.log(`✅ Guardado: exercise_sets.json`)
    
    // Guardar resumen
    const summary = {
      total_guides: guides.length,
      total_weeks: weeks.length,
      total_sessions: sessions.length,
      total_unique_exercises: exercisesArray.length,
      total_unique_sets: setsArray.length,
      total_session_exercise_relations: sessionExercises.length,
      total_exercise_set_relations: exerciseSets.length,
      optimization_date: new Date().toISOString(),
      most_used_exercises: exercisesArray
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10)
        .map(ex => ({ title: ex.title, usage_count: ex.usage_count })),
      most_used_sets: setsArray
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10)
        .map(set => ({ 
          series: set.set_series, 
          reps: set.set_reps, 
          rest: set.set_rest,
          usage_count: set.usage_count 
        }))
    }
    
    fs.writeFileSync(`${outputDir}/optimization_summary.json`, JSON.stringify(summary, null, 2))
    console.log(`✅ Guardado: optimization_summary.json`)
    
    console.log('\n🎉 OPTIMIZACIÓN COMPLETADA!')
    console.log(`📁 Archivos guardados en: ${outputDir}`)
    
    return summary
    
  } catch (error) {
    console.error('Error optimizando datos:', error)
    throw error
  }
}

async function optimizeAndDivideRoutineData(inputFilePath, outputDir = './core/optimized_data_2') {
   try {
    console.log('📊 ANALIZANDO Y UNIFICANDO DATOS DE ROUTINES...')

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    const originalData = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'))

    // Cargar datos existentes (si existen) para continuar y no sobreescribir
    const readOrEmpty = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : []

    const routines = readOrEmpty(`${outputDir}/guides.json`)
    const routineWeeks = readOrEmpty(`${outputDir}/weeks.json`)
    const routineSessions = readOrEmpty(`${outputDir}/sessions.json`)
    const existingExercises = readOrEmpty(`${outputDir}/exercises.json`)
    const existingSets = readOrEmpty(`${outputDir}/sets.json`)
    const sessionExerciseRelations = readOrEmpty(`${outputDir}/session_exercises.json`)
    const exerciseSetRelations = readOrEmpty(`${outputDir}/exercise_sets.json`)

    // Convertir a Map para deduplicar correctamente
    const uniqueExercises = new Map(existingExercises.map(ex => [ex.hash, ex]))
    const uniqueSets = new Map(existingSets.map(set => [set.hash, set]))

    for (let guideIndex = 0; guideIndex < originalData.length; guideIndex++) {
      const guide = originalData[guideIndex]
      const guideId = uuidv4()

      routines.push({
        id: guideId,
        original_id: guide.id,
        title: guide.title,
        link: guide.link,
        image_url: guide.image
      })

      if (guide.weeks) {
        for (const week of guide.weeks) {
          const weekId = uuidv4()
          routineWeeks.push({
            id: weekId,
            guide_id: guideId,
            week_title: week.week_title,
            week_link: week.week_link,
            week_index: week.week_index
          })

          /// The session corresponds to the week, so we can use the weekId
          // Crear una sesión por semana, con un ID único
          const sessionId = uuidv4()
          routineSessions.push({
            id: sessionId,
            week_id: weekId,
            day_number: 1,
            title: week.week_title,
            link: week.week_link,
          })

          if (week.days) {
            for (let dayIndex = 0; dayIndex < week.days.length; dayIndex++) {
              const exercise = week.days[dayIndex]

              const exerciseHash = generateExerciseHash(exercise)

              if (!uniqueExercises.has(exerciseHash)) {
                uniqueExercises.set(exerciseHash, {
                  id: uuidv4(),
                  hash: exerciseHash,
                  title: exercise.title,
                  video_url: exercise.video_url,
                  usage_count: 1
                })
              } else {
                uniqueExercises.get(exerciseHash).usage_count++
              }

              sessionExerciseRelations.push({
                id: uuidv4(),
                session_id: sessionId,
                exercise_id: uniqueExercises.get(exerciseHash).id,
                order_in_session: dayIndex + 1
              })

              if (exercise.sets) {
                for (let setIndex = 0; setIndex < exercise.sets.length; setIndex++) {
                  const set = exercise.sets[setIndex]
                  const setHash = generateSetHash(set)

                  if (!uniqueSets.has(setHash)) {
                    uniqueSets.set(setHash, {
                      id: uuidv4(),
                      hash: setHash,
                      set_series: set.set_series,
                      set_reps: set.set_reps,
                      set_rest: set.set_rest,
                      usage_count: 1
                    })
                  } else {
                    uniqueSets.get(setHash).usage_count++
                  }

                  exerciseSetRelations.push({
                    id: uuidv4(),
                    session_id: sessionId,
                    exercise_id: uniqueExercises.get(exerciseHash).id,
                    set_id: uniqueSets.get(setHash).id,
                    order_in_exercise: setIndex + 1
                  })
                }
              }
            }
          }
        }
      }
    }

    // Preparar arrays finales
    const exercisesArray = Array.from(uniqueExercises.values())
    const setsArray = Array.from(uniqueSets.values())

    // Guardar unificando en los mismos archivos ya existentes (antes guides, ahora guides + routines)

    fs.writeFileSync(`${outputDir}/guides.json`, JSON.stringify(routines, null, 2))
    fs.writeFileSync(`${outputDir}/weeks.json`, JSON.stringify(routineWeeks, null, 2))
    fs.writeFileSync(`${outputDir}/sessions.json`, JSON.stringify(routineSessions, null, 2))
    fs.writeFileSync(`${outputDir}/exercises.json`, JSON.stringify(exercisesArray, null, 2))
    fs.writeFileSync(`${outputDir}/sets.json`, JSON.stringify(setsArray, null, 2))
    fs.writeFileSync(`${outputDir}/session_exercises.json`, JSON.stringify(sessionExerciseRelations, null, 2))
    fs.writeFileSync(`${outputDir}/exercise_sets.json`, JSON.stringify(exerciseSetRelations, null, 2))

    const summary = {
      total_guides_or_routines: routines.length,
      total_weeks: routineWeeks.length,
      total_sessions: routineSessions.length,
      total_unique_exercises: exercisesArray.length,
      total_unique_sets: setsArray.length,
      total_session_exercise_relations: sessionExerciseRelations.length,
      total_exercise_set_relations: exerciseSetRelations.length,
      optimization_date: new Date().toISOString(),
      most_used_exercises: exercisesArray
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10)
        .map(ex => ({ title: ex.title, usage_count: ex.usage_count })),
      most_used_sets: setsArray
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10)
        .map(set => ({
          series: set.set_series,
          reps: set.set_reps,
          rest: set.set_rest,
          usage_count: set.usage_count
        }))
    }

    fs.writeFileSync(`${outputDir}/summary.json`, JSON.stringify(summary, null, 2))

    console.log('\n🎉 UNIFICACIÓN COMPLETADA!')
    console.log(`📁 Archivos actualizados en: ${outputDir}`)

    return summary

  } catch (error) {
    console.error('Error optimizando datos:', error)
    throw error
  }
}


// ===============================
// 3. IMPORTADOR DE DATOS OPTIMIZADOS
// ===============================

async function importOptimizedData(dataDir = './core/optimized_data_2') {
  try {
    console.log('📤 IMPORTANDO DATOS OPTIMIZADOS A SUPABASE...')
    
    // Leer archivos optimizados
    const guides = JSON.parse(fs.readFileSync(`${dataDir}/guides.json`, 'utf8'))
    const weeks = JSON.parse(fs.readFileSync(`${dataDir}/weeks.json`, 'utf8'))
    const sessions = JSON.parse(fs.readFileSync(`${dataDir}/sessions.json`, 'utf8'))
    const exercises = JSON.parse(fs.readFileSync(`${dataDir}/exercises.json`, 'utf8'))
    const sets = JSON.parse(fs.readFileSync(`${dataDir}/sets.json`, 'utf8'))
    const sessionExercises = JSON.parse(fs.readFileSync(`${dataDir}/session_exercises.json`, 'utf8'))
    const exerciseSets = JSON.parse(fs.readFileSync(`${dataDir}/exercise_sets.json`, 'utf8'))
    
    // Función para insertar en lotes
    async function insertInBatches(tableName, data, batchSize = 100) {
      console.log(`Insertando ${data.length} registros en ${tableName}...`)
      
      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize)
        const { error } = await supabase.from(tableName).insert(batch)
        
        if (error) {
          console.error(`Error insertando lote en ${tableName}:`, error)
          throw error
        }
        
        if (i % (batchSize * 10) === 0) {
          console.log(`  Progreso: ${Math.min(i + batchSize, data.length)}/${data.length}`)
        }
      }
      
      console.log(`✅ ${tableName} completado`)
    }
    
    // Insertar en orden correcto (respetando foreign keys)
    await insertInBatches('guides', guides.map(g => ({
      id: g.id,
      title: g.title,
      link: g.link,
      image_url: g.image_url
    })))
    
    await insertInBatches('weeks', weeks.map(w => ({
      id: w.id,
      guide_id: w.guide_id, // Necesitarás mapear estos IDs
      week_title: w.week_title,
      week_link: w.week_link,
      week_index: w.week_index
    })))
    
    await insertInBatches('sessions', sessions.map(s => ({
      id: s.id,
      week_id: s.week_id, // Necesitarás mapear estos IDs
      day_number: s.day_number,
      title: s.title,
      link: s.link
    })))
    
    await insertInBatches('exercises', exercises.map(e => ({
      id: e.id,
      title: e.title,
      video_url: e.video_url
    })))
    
    await insertInBatches('sets', sets.map(s => ({
      id: s.id,
      set_series: s.set_series,
      set_reps: s.set_reps,
      set_rest: s.set_rest
    })))

    await insertInBatches('exercise_sets', exerciseSets.map(s => ({
      id: s.id,
      session_id: s.session_id,
      exercise_id: s.exercise_id, 
      set_id: s.set_id,
      order_in_exercise: s.order_in_exercise
    })))

    await insertInBatches('session_exercises', sessionExercises.map(s => ({
      id: s.id,
      session_id: s.session_id,
      exercise_id: s.exercise_id,
      order_in_session: s.order_in_session
    })))
    
    console.log('🎉 IMPORTACIÓN COMPLETADA!')
    
  } catch (error) {
    console.error('Error importando datos optimizados:', error)
    throw error
  }
}

// ===============================
// 4. FUNCIÓN PRINCIPAL
// ===============================

async function main() {
  const mode = process.argv[2] || 'help'
  const inputFile = process.argv[3] || './training_data.json'
  const outputDir = process.argv[4] || './optimized_data_2'
  
  switch(mode) {
    case 'clear':
      await clearAllTables()
      break
      
    case 'optimizeGuide':
      await optimizeAndDivideGuideData(inputFile, outputDir)
      break
      
    case 'optimizeRoutine':
      await optimizeAndDivideRoutineData(inputFile, outputDir)
      break
      
    case 'import':
      await importOptimizedData(outputDir)
      break
      
    case 'full':
      console.log('🔄 PROCESO COMPLETO: OPTIMIZAR E IMPORTAR')
      // await optimizeAndDivideData(inputFile, outputDir)
      await importOptimizedData(outputDir)
      break
      
    case 'help':
    default:
      console.log('=== OPTIMIZADOR DE DATOS DE ENTRENAMIENTO ===')
      console.log('Comandos disponibles:')
      console.log('  clear                    - Vaciar todas las tablas')
      console.log('  optimize [input] [output] - Optimizar y dividir datos')
      console.log('  import [dataDir]         - Importar datos optimizados')
      console.log('  full [input] [output]    - Proceso completo')
      console.log('')
      console.log('Ejemplos:')
      console.log('  node script.js clear')
      console.log('  node script.js optimize ./big_data.json ./optimized')
      console.log('  node script.js import ./optimized')
      console.log('  node script.js full ./big_data.json ./optimized')
      console.log('===========================================')
  }
}

// Ejecutar
main().catch(console.error)

export { 
  clearAllTables, 
  optimizeAndDivideGuideData, 
  optimizeAndDivideRoutineData,
  importOptimizedData,
  generateExerciseHash,
  generateSetHash
}