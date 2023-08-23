const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
} = require("@bot-whatsapp/bot");

// const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const JsonFileAdapter = require("@bot-whatsapp/database/json");
const bodyParser = require("body-parser");

const express = require("express");
const app = express();
app.use(bodyParser.json());

/**
 * Aqui declaramos los flujos hijos, los flujos se declaran de atras para adelante, es decir que si tienes un flujo de este tipo:
 *
 *          Menu Principal
 *           - SubMenu 1
 *             - Submenu 1.1
 *           - Submenu 2
 *             - Submenu 2.1
 *
 * Primero declaras los submenus 1.1 y 2.1, luego el 1 y 2 y al final el principal.
 */

const flowContableHijo = addKeyword("1").addAnswer([
  "📄 Adjunta el soporte de pago ó enviar al correo soporte@gestionshop.co",
]);

const flowSoporteHijo = addKeyword("2")
  .addAnswer(
    "La factura se enviará al correo registrado o puedes consultarla en el programa, accediendo a *Consultar facturas de GestionShop* en la esquina superior derecha",
    {
      media:
        "https://res.cloudinary.com/dmeolkzir/image/upload/v1686683865/chatBot/Captura_de_pantalla_2023-06-13_a_la_s_2.03.32_p.m._gzsval.png",
    }
  )
  .addAnswer(
    "*Importante:* Debes verificar si tu usuario tiene el permiso para ver las facturas de GestionShop"
  );

const flowContable = addKeyword("2").addAnswer(
  ["1️⃣ Para enviar soporte de pago", "2️⃣ Para solicitar reenvio de factura"],
  null,
  null,
  [flowContableHijo, flowSoporteHijo]
);

const flowBotones = addKeyword("botones").addAnswer("Estos son botones", {
  // no he podido hacer que funcionen
  buttons: [
    {
      body: "imagen",
    },
    {
      body: "Inicio",
    },
  ],
});

const flowSoporte = addKeyword(["3"])
  .addAnswer("Aquí encontrarás respuestas a tus preguntas")
  .addAnswer("Consulta nuestro manual https://ayuda.gestionshop.co", {
    media:
      "https://res.cloudinary.com/dmeolkzir/image/upload/v1686683865/chatBot/Captura_de_pantalla_2023-06-13_a_la_s_2.07.20_p.m._ce1ytj.png",
  })
  .addAnswer(
    "Para recibir asistencia, te recomendamos utilizar el chat de soporte ubicado en la parte inferior derecha de nuestro sistema GestionShop. Puedes acceder a él y realizar tus consultas para obtener ayuda de nuestro equipo",
    {
      media:
        "https://res.cloudinary.com/dmeolkzir/image/upload/v1686683855/chatBot/Soporte_eykbin.png",
    }
  )
  .addAnswer("\n Escribe *inicio* para regresar el menu principal");

const flowComercial = addKeyword(["1"])
  .addAnswer(
    "🚀 ¡Hola! Gracias por tu interés en nuestros servicios. Para brindarte una mejor atención, necesitamos algunos datos. ¿Podrías proporcionarme tu nombre y correo electrónico, por favor?",
    { capture: true },
    (ctx) => {
      console.log("ctx", ctx); // ctx es el contexto del mensaje, puedo sacar lo que escribe y el numero de cel y el alias del whatsapp
    }
  )
  .addAnswer([
    `¡Gracias! En breve serás atendido por uno de nuestros asesores. ¿Hay algo más en lo que pueda ayudarte?`,
    "\nTe invito a conocer más de nosotros https://gestionshop.co",
    "\nSiguenos en instagram  https://hab.me/eBX4L8I",
  ]);

const flowPrincipal = addKeyword([
  "hola",
  "menu",
  "inicio",
  "ole",
  "alo",
  "ola",
  "hoka",
  "hi",
  "buenos dias",
  "buenas tardes",
  "hola, buenos dias",
  "hola buenas tardes",
  "buenas",
  "hola como estan",
  "hila",
])
  .addAnswer([
    "👋🏼 Hola bienvenid@ a *GestionShop* El software ideal para administrar almacenes de compraventa\n",
    "Soy GestiBot 🔮 tu asesor virtual",
  ])
  .addAnswer(
    [
      "Escoge una de la siguientes opciones de atencion escribiendo el numero\n",
      "1️⃣ Para asesoría comercial",
      "2️⃣ Para atención en el área contable",
      "3️⃣ Para atención al cliente (soporte)\n",
    ],
    null,
    null,
    [flowContable, flowComercial, flowSoporte]
  );

const main = async () => {
  const adapterDB = new JsonFileAdapter();
  const adapterFlow = createFlow([flowPrincipal]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  /**
   * Enviar mensaje con metodos propios del provider del bot
   */
  app.post("/send-message-bot-media", async (req, res) => {
    const { phone, mediaUrl, message } = req.body;
    await adapterProvider.sendMedia(`${phone}@c.us`, mediaUrl, message );
    res.send({ data: "WhatsApp imagen enviado!" });
  });

  app.post("/send-message-bot-pdf", async (req, res) => {
    const { phone, mediaUrl } = req.body;
    await adapterProvider.sendFile(`${phone}@c.us`, mediaUrl);
    res.send({ data: "WhatsApp pdf enviado!" });
  });

  // app.use(sendTextRouter) //Se ejecuta el bot a cada instante
  app.post("/send-message-bot-text", async (req, res) => {
    const { phone, message } = req.body;
    await adapterProvider.sendText(`${phone}@c.us`, message);
    res.send({ data: "WhatsApp texto enviado!" });
  });
  /**
   * Fin de api whatsapp
   */

  // Ruta para servir archivos estáticos
  app.use(express.static("public"));

  // Ruta de inicio
  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
  });

  app.get("/static/bot.qr.png", (req, res) => {
    res.sendFile(__dirname + "/bot.qr.png");
  });

  // Iniciar el servidor
  const port = process.env.PORT || 3003;
  app.listen(port, () => {
    console.log(`Servidor iniciado en http://localhost:${port}`);
  });

  // QRPortalWeb();
};

main();
