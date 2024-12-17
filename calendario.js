const emailUsuario = obtenerParametroURL("email"); //Variable que almacena el email intorducido por el usuario
const pwdUsuario = obtenerParametroURL("pwd"); //Variable que almacena la contraseña introducida por el usuario
const botonVolver = document.getElementById("volver"); //Elemento HTML que almacena el boton que vuelve al Login
const contenedorInfo = document.getElementById("informacionDia"); //Elemento HTML que almacena el contenedor de la información general del dia
const listaEventos = document.getElementById("listaEventos"); //Elemento HTML que almacena la lista de eventos del dia
const botonNuevoEvento = document.getElementById("enviar"); //Elemento HTML que almacena el boton que inserta un evento
const tabla = document.getElementById("tablaCalendario"); //Elemento HTML que almacena la tabla que funciona como calendario
const contenedorModificar = document.getElementById("contenedorModificarEvento"); //Elemento HTML que almacena el contenedor del formulario para modificar un evento
const contenedorEvento = document.getElementById("contenedorEvento"); //Elemento HTML que almacena el contenedor del formulario para insertar un evento
const fechaDia = document.getElementById("dia"); //Elemento HTML que almacena el contenedor con la fecha del dia

//Metodo que obtiene un parametro de la URL a partir del nombre de dicho parametro
function obtenerParametroURL(nombre){
    const urlSearchParams = new URLSearchParams(window.location.search);
    return urlSearchParams.get(nombre)
}

const eventos = []; //Array que inicializa los eventos del usuario

//Objeto JSON que almacena los datos del usuario que se ha registrado
const usuarioLogeado = {
    email:emailUsuario,
    pwd:pwdUsuario,
    eventos: eventos
};

let listaUsuarios; //Array que almacena los usuarios registrados

//Si la lista de usuarios no esta almacenada en el navegador, se creará con el usuario registrado y se almacenará
if(sessionStorage["listaUsuarios"] == null){
    listaUsuarios = new Array(0);
    listaUsuarios.push(usuarioLogeado);

    sessionStorage.setItem("listaUsuarios",JSON.stringify(listaUsuarios));
//En caso de que ya exista, se importa la lista a local
}else{
    listaUsuarios = JSON.parse(sessionStorage.getItem("listaUsuarios"));
    importarEventos(usuarioLogeado);
}

//Metodo que importa los eventos del usuario en caso de que ya tenga y los inicializa en caso de que no tenga eventos
function importarEventos(usuario){
    let encontrado = false;
    let i = 0;

    //Se recorre toda la lista de usuario hasta encontrar el usuario registrado actualmente
    while(!encontrado && i < listaUsuarios.length){
        if(listaUsuarios[i].email == usuario.email && listaUsuarios[i].pwd == usuario.pwd){
            encontrado = true;
        }else{
            i++;
        }
    }

    //Si se encuentra al usuario, es decir, ya se registró con anteriodidad, se le importan sus eventos a local
    if(encontrado){
        usuario.eventos = listaUsuarios[i].eventos;

    //En caso contrario, se añade el usuario a la lista para posteriores registros
    }else{
        listaUsuarios.push(usuarioLogeado);
    }
}

//Al clickar en el boton de volver, se guarda la lista de usuarios en el navegador y redirecciona al usuario al login
botonVolver.addEventListener("click", () => {
    sessionStorage.setItem("listaUsuarios",JSON.stringify(listaUsuarios));
    location("index.html");
})

//Al clickar en el boton de nuevo evento, se creará un evento para el dia seleccionado y se mostrará la lista actualizada
botonNuevoEvento.addEventListener("click", () => {
    nuevoEvento(botonNuevoEvento.getAttribute("numDia"));
    mostrarEventos(botonNuevoEvento.getAttribute("numDia"));
    marcarDiasConEvento();
});

//Se genera el calendario
generarTabla();

//Metodo que genera el calendario de cero
function generarTabla(){
    let numeroDia = 30;
    let mesAntiguoSuperado = false;
    let alcanzadoNuevoMes = false;
    
    //Se recorren todas las filas y columnas de la tabla de manera individual para asignarle los dias
    for(let fila = 0; fila < 5; fila++){
        let filaTabla = document.createElement("tr");
        for(let columna = 0; columna < 7; columna++){
            let columnaTabla = document.createElement("td");
            columnaTabla.innerText = numeroDia;
            columnaTabla.setAttribute("id",numeroDia);

            //Si el dia pertenece al mes anterior, se elimina su id, se reinicia el numero de dia, se indica que el dia pertenece a otro mes y se marca en el bucle
            if(numeroDia == 30 && !mesAntiguoSuperado){
                numeroDia = 0;
                mesAntiguoSuperado = true;
                columnaTabla.setAttribute("otroMes","otroMes");
                columnaTabla.removeAttribute("id");
            }

            //Si estamos en el mes actual y aun no hemos alcanzado el nuevo mes, se crea un dia convencional
            if(mesAntiguoSuperado && !alcanzadoNuevoMes && numeroDia != 0){
                //Al hacer click sobre un dia normal, se seleccionará y se abrirá un menu a la derecha para modificar sus eventos
                columnaTabla.addEventListener("click", () => {
                    contenedorModificar.style.visibility = "hidden";
                    tabla.querySelectorAll("td[seleccionado]").forEach(function (elemento) {
                        elemento.removeAttribute("seleccionado");
                    })
                    columnaTabla.setAttribute("seleccionado","true");
                    contenedorEvento.style.visibility = "visible";
                    mostrarInformacionDia(columnaTabla);
                })
            }

            //Si se ha superado el mes deseado, se elimina su id y se indica que pertenece a otro mes
            if(alcanzadoNuevoMes){
                columnaTabla.setAttribute("otroMes","otroMes");
                columnaTabla.removeAttribute("id");
            }

            //Si es el ultimo dia del mes y aun no se ha alcanzado el nuevo mes, se indica que se ha alcanzado y se reinicia el numero de dia
            if(numeroDia == 31 && !alcanzadoNuevoMes){
                alcanzadoNuevoMes = true;
                numeroDia = 0;
            }


            //Se añade el dia como hijo a la fila de la tabla y se aumenta el numero de dia
            filaTabla.appendChild(columnaTabla);
            numeroDia++;
        }

        //Se añade la fila con los dias como hijo a la tabla
        tabla.appendChild(filaTabla);
        //Se marcan los dias que tengan evento
        marcarDiasConEvento();
    }
}

//Metodo que muestra el menu con la información del dia y sus eventos
function mostrarInformacionDia(dia){
    let numDia = dia.innerText;
    contenedorEvento.style.visibility = "visible";
    fechaDia.style.visibility = "visible";
    listaEventos.style.visibility = "visible";

    //Se asignan los valores del dia a la información del menu
    const mensajeFecha = contenedorInfo.querySelector("p");
    const diaSemana = contenedorInfo.querySelector("h1");
    mensajeFecha.innerText = numDia + " de Octubre de 2024";
    diaSemana.innerText = obtenerDiaSemana(parseInt(numDia));
    botonNuevoEvento.setAttribute("numDia",numDia);
    //Se muestran los eventos
    mostrarEventos(numDia);
}

//Metodo que crea un evento y lo añade a la lista de eventos del usuario con los valores del formulario 
function nuevoEvento(numDia){
    const nombreEvento = document.getElementById("nombre").value;
    const inicioEvento = document.getElementById("inicio").value;
    const finalEvento = document.getElementById("final").value;

    const evento = {
        nombre: nombreEvento,
        inicio: inicioEvento,
        final: finalEvento,
        dia: numDia
    }

    usuarioLogeado.eventos.push(evento);
}

//Metodo que muestra los eventos de un dia
function mostrarEventos(numDia){
    listaEventos.innerHTML = "";
    usuarioLogeado.eventos.forEach((evento) => {
        if(evento.dia == numDia){
            mostrarEventoDia(evento, numDia);
        }
    })
}

//Metodo que añade la información de un evento a la lista de eventos del menu
function mostrarEventoDia(evento, numDia){
    const nuevoEvento = document.createElement("div");
    nuevoEvento.setAttribute("class","evento");

    const apartadoPrincipal = document.createElement("div");
    apartadoPrincipal.setAttribute("class","principal");
    const botonModificar = document.createElement("button");
    botonModificar.setAttribute("class","modificar");

    //Al hacer click al botón ubicado a la izquierda del nombre del evento, se muestra el formulario para modificar o eliminar un evento
    botonModificar.addEventListener("click", () => {
        modificarEvento(evento, numDia);
    })

    const nombreEvento = document.createElement("p");
    nombreEvento.innerText = evento.nombre;
    apartadoPrincipal.appendChild(botonModificar);
    apartadoPrincipal.appendChild(nombreEvento);

    const duracion = document.createElement("div");
    duracion.setAttribute("class","duracion");
    duracion.innerText = evento.inicio + " - " + evento.final;

    nuevoEvento.appendChild(apartadoPrincipal);
    nuevoEvento.appendChild(duracion);

    listaEventos.appendChild(nuevoEvento);
}

//Metodo que devuelve como texto el dia de la semana a la que pertenece el dia en base a su numero
function obtenerDiaSemana(numDia){
    const diasLunes = [7,14,21,28];
    const diasMartes = [1,8,15,22,29];
    const diasMiercoles = [2,9,16,23,30];
    const diasJueves = [3,10,17,24,31];
    const diasViernes = [4,11,18,25];
    const diasSabado = [5,12,19,26];
    const diasDomingo = [6,13,20,27];

    if(diasLunes.findIndex((a) => a == numDia) != -1){
        return "Lunes";
    }

    if(diasMartes.findIndex((a) => a == numDia) != -1){
        return "Martes";
    }

    if(diasMiercoles.findIndex((a) => a == numDia) != -1){
        return "Miercoles";
    }

    if(diasJueves.findIndex((a) => a == numDia) != -1){
        return "Jueves";
    }

    if(diasViernes.findIndex((a) => a == numDia) != -1){
        return "Viernes";
    }

    if(diasSabado.findIndex((a) => a == numDia) != -1){
        return "Sabado";
    }

    if(diasDomingo.findIndex((a) => a == numDia) != -1){
        return "Domingo";
    }
}

//Metodo que recorre todos los dias de la tabla para colocarles un marcador en caso de que tengan un evento
function marcarDiasConEvento(){
    let tieneEvento = false;
    let posEvento = 0;

    tabla.querySelectorAll("tr td").forEach((elemento) => {

        elemento.removeAttribute("class");
        
        //Se recorren todos los eventos del usuario y si un evento tiene el mismo numero de dia que el valor de la id del dia, se marcará que tiene evento para aplicarle un estilo mas tarde
        while(!tieneEvento && posEvento < usuarioLogeado.eventos.length){
            if(usuarioLogeado.eventos[posEvento].dia == elemento.getAttribute("id")){
                tieneEvento = true;
            }else{
                posEvento++;
            }
        }

        if(tieneEvento){
            elemento.setAttribute("class","conEvento");
        }

        posEvento = 0;
        tieneEvento = false;
    })

}

//Metodo que muestra el formulario que permite modificar y eliminar un evento
function modificarEvento(evento, numDia){
    contenedorModificar.style.visibility = "visible";
    contenedorEvento.style.visibility = "hidden";
    const nombreNuevo = document.getElementById("nombreNuevo");
    nombreNuevo.value = evento.nombre;
    const inicioNuevo = document.getElementById("inicioNuevo");
    inicioNuevo.value = evento.inicio;
    const finalNuevo = document.getElementById("finalNuevo");
    finalNuevo.value = evento.final;

    const botonCambio = document.getElementById("modificar");
    //Al hacer click al boton de modificación, se modifican los valores del evento seleccionado y se reinicia la lista de eventos
    botonCambio.addEventListener("click", () => {
        evento.nombre = nombreNuevo.value;
        evento.inicio = inicioNuevo.value;
        evento.final = finalNuevo.value;
        mostrarEventos(numDia);
    }) 

    const botonCancelar = document.getElementById("cancelar");
    //Al hacer click al boton de cancelar, se cierra el menu de modificación y se abre el de insreción
    botonCancelar.addEventListener("click", () => {
        contenedorModificar.style.visibility = "hidden";
        contenedorEvento.style.visibility = "visible";
    })

    const botonEliminar = document.getElementById("eliminar");
    //Al hacer click al boton de eliminar, se eliminará el evento de la lista del usuario y se vuelven a marcar los dias con evento
    botonEliminar.addEventListener("click", () => {
        eliminarEvento(evento, numDia);
        marcarDiasConEvento();
    })
}

//Metodo que elimina un evento de la lista del usuario y oculta el menu de modificación para mostrar el de inserción
function eliminarEvento(evento, numDia){
    contenedorModificar.style.visibility = "hidden";
    contenedorEvento.style.visibility = "visible";
    let posEliminar = sacarPosicionEvento(evento);
    usuarioLogeado.eventos.splice(posEliminar, 1);
    
    //Se reinicia la lista de eventos
    mostrarEventos(numDia);
}

//Metodo que saca la posición de un evento en la lista de eventos del usuario
function sacarPosicionEvento(evento){
    let encontrado = false;
    let i = 0;

    //Se recorre toda la lista hasta que se encuentre el evento seleccionado
    while(!encontrado && i < usuarioLogeado.eventos.length){
        elemento = usuarioLogeado.eventos[i];
        if(elemento.nombre == evento.nombre && elemento.dia == evento.dia && elemento.inicio == evento.inicio && elemento.final == evento.final){
            encontrado = true;
        }else{
            i++;
        }
    }

    //Devuelve su posición
    return i;
}