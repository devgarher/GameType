# 🧟 DEAD TYPE: Zombie Survival Typing Game

Un juego arcade de mecanografía en inglés inspirado en clásicos como *The Typing of the Dead*. Sobrevive a oleadas de muertos vivientes escribiendo palabras en inglés a toda velocidad para dispararles y defender tu barricada.

---

## 🎮 Cómo Jugar

1. Haz doble clic en `start_game.bat` o abre `index.html` en tu navegador web favorito (Chrome, Edge, Firefox, Brave, etc.).
2. Presiona **ENTER** o haz clic en **START GAME** para comenzar.
3. Observa los zombis que descienden hacia tu barricada:
   - Encima de cada uno verás una **palabra en inglés**.
   - Al teclear la primera letra de una palabra, tu torreta se **fija automáticamente** en el zombi más cercano que coincide con esa letra.
   - Cada letra que escribas dispara un tiro que impacta al zombi:
     - Las letras acertadas se iluminan en **verde neón**.
     - La siguiente letra a teclear se resalta en **amarillo dorado**.
     - Al completar la palabra, ¡el zombi explota en pedazos y ganas puntos!
4. **Combos y Racha:** Escribir sin equivocarte acumula combos y multiplica tus puntos. Si fallas una tecla, se reinicia el combo.
5. **No dejes que alcancen la barricada:** Si un zombi cruza la línea de defensa, causará daño a tu barricada. ¡Si llega a 0 HP, se acaba la partida!

---

## 🧟 Tipos de Zombis

| Clase | Color | Velocidad | Longitud de Palabra | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Walker** | Verde | Normal | 3 a 5 letras | Zombis comunes que avanzan a paso constante. |
| **Runner** | Rojo | Rápida | 3 a 5 letras | Rápidos y agresivos; priorízalos antes de que alcancen tu muro. |
| **Tank / Brute** | Azul / Púrpura | Lenta | 7 a 9 letras | Gigantes con mucha resistencia que exigen palabras más complejas. |
| **Boss / Titan** | Púrpura oscuro | Lenta | 10+ letras | Aparecen en oleadas clave con vocabulario avanzado. |

---

## 🔊 Efectos de Sonido Sintetizados (Web Audio API)

El juego utiliza el motor de audio sintético del navegador:
- Disparos balísticos y recargas con respuesta táctil.
- Gruñidos y explosiones sangrientas al derrotar zombis.
- Tono ascendente dinámico por cada acierto en combo.
- Sirena de alarma al comenzar cada oleada.
- Atmósfera ambiental de terror.
- Botón para silenciar o activar sonido (`🔊 Sound: ON/OFF`).

---

## 📊 Estadísticas al Terminar

Al concluir la partida podrás evaluar tu progreso:
- **WPM (Words Per Minute):** Velocidad real de tecleo.
- **Accuracy (%):** Porcentaje de precisión en el teclado.
- **Oleadas sobrevividas y zombis abatidos.**
- **Rango de supervivencia:** (Rookie, Survivor, Veteran, Deadeye Marksman o Legendary Slayer).
