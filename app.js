const { createBot, createProvider, createFlow, addKeyword } = require('@bot-whatsapp/bot')

const QRPortalWeb = require('@bot-whatsapp/portal')
const BaileysProvider = require('@bot-whatsapp/provider/baileys')
const JsonFileAdapter = require('@bot-whatsapp/database/json')

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

const flowSecundario = addKeyword(['2', 'siguiente']).addAnswer(['📄 Aquí tenemos el flujo secundario'])

const flowContableHijo = addKeyword('1').addAnswer(
    [
        '📄 Adjunta el soporte de pago ó enviar al correo soporte@gestionshop.co',
    ]
)

const flowSoporteHijo = addKeyword('2').addAnswer('La factura se enviará al correo registrado o puedes consultarla en el programa, accediendo a *Consultar facturas de GestionShop* en la esquina superior derecha',
    {media: 'https://res.cloudinary.com/dmeolkzir/image/upload/v1686683865/chatBot/Captura_de_pantalla_2023-06-13_a_la_s_2.03.32_p.m._gzsval.png'})
    .addAnswer('*Importante:* Debes verificar si tu usuario tiene el permiso para ver las facturas de GestionShop')

const flowContable = addKeyword('2').addAnswer(
    [
        '👉 *1* Para enviar soporte de pago',
        '👉 *2* Para solicitar reenvio de factura',
    ],
    null,
    null,
    [flowContableHijo, flowSoporteHijo]
)

const flowBotones = addKeyword('botones').addAnswer('Estos son botones', { // no he podido hacer que funcionen
    buttons:[
        {
            body:'imagen'
        },
        {
            body:'Inicio'
        }
    ]
})

const flowSoporte = addKeyword(['3'])
        .addAnswer('Aquí encontrarás respuestas a tus preguntas')
        .addAnswer('Consulta nuestro manual https://ayuda.gestionshop.co', {media : 'https://res.cloudinary.com/dmeolkzir/image/upload/v1686683865/chatBot/Captura_de_pantalla_2023-06-13_a_la_s_2.07.20_p.m._ce1ytj.png'})
        .addAnswer('Para recibir asistencia, te recomendamos utilizar el chat de soporte ubicado en la parte inferior derecha de nuestro sistema GestionShop. Puedes acceder a él y realizar tus consultas para obtener ayuda de nuestro equipo',{media :'https://res.cloudinary.com/dmeolkzir/image/upload/v1686683855/chatBot/Soporte_eykbin.png'})
        .addAnswer('\n Escribe *inicio* para regresar el menu principal')


const flowComercial = addKeyword(['1'])
    .addAnswer('🚀 ¡Hola! Gracias por tu interés en nuestros servicios. Para brindarte una mejor atención, necesitamos algunos datos. ¿Podrías proporcionarme tu nombre y correo electrónico, por favor?',
         {capture: true},(ctx) => {
            console.log('ctx', ctx) // ctx es el contexto del mensaje, puedo sacar lo que escribe y el numero de cel y el alias del whatsapp
         }
    )
    .addAnswer(`¡Gracias! En breve serás atendido por uno de nuestros asesores. ¿Hay algo más en lo que pueda ayudarte?`)

const flowPrincipal = addKeyword(
    [
        'hola','menu','inicio', 'ole', 'alo', 'ola', 'buenos dias', 'buenas tardes', 'hola, buenos dias', 'hola buenas tardes', 'buenas', 'hola como estan'
])
    .addAnswer('👋🏼 Hola bienvenid@ a *GestionShop*\n', 'Soy GestiBot 🔮 tu asesor virtual')
    .addAnswer(
        [
            'Te comparto las siguientes opciones de atención \n',
            '👉 *1* Para asesoría comercial',
            '👉 *2* Para atención en el área contable',
            '👉 *3* Para atención al cliente (soporte)\n',
            'Escribe el numero de la opción seleccionada'
            // '👉 *discord* unirte al discord',
        ],
        null,
        null,
        [flowContable, flowComercial, flowSoporte, flowBotones]
    )


const main = async () => {
    const adapterDB = new JsonFileAdapter()
    const adapterFlow = createFlow([flowPrincipal])
    const adapterProvider = createProvider(BaileysProvider)

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    })

    QRPortalWeb()
}

main()
