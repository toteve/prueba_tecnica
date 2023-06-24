const clp = document.getElementById("pesos");
const urlAPI = "https://mindicador.cl/api";
const resultado = document.getElementById("resultado");
const tabla = document.getElementById("lista-usuario");
const moneda = document.getElementById("moneda");
const chartDOM = document.getElementById("myChart2").getContext("2d");
const cantidad = document.getElementById("cantidad");

document.querySelector(".fecha").innerHTML = new Date().toLocaleString();


// Funcion Peticion Api con moneda elegida y adecuarlos para graficarlos
async function cargarDatos(moneda) {
  try {
    const divisas = await getMonedas(urlAPI + "/" + moneda.value);
    const fechas = divisas.serie.map((elemento) => {
      return elemento.fecha.split("T")[0];
    });
    const etiquetas = divisas.serie.map((etiq) => {return etiq.valor;});

    return { fechas, etiquetas };
  } catch (e) {
    alert("Fallo en la obtención de datos para la gráfica. Intente nuevamente");
  }
}


// Funcion que construye la grafica
async function renderGrafica() {
  const tipoDeGrafica = "line";
  const colorBG = "#" + randomHex(6);
  const colorDeLinea = "#" + randomHex(6);     

  try {
    const datosRender = await cargarDatos(moneda);
    const titulo = moneda.value.toUpperCase();

    const config = {
      type: tipoDeGrafica,
      data: {
        labels: datosRender.fechas.reverse().slice(-10),
        datasets: [
          {
            //Aqui cada objeto representa un indicador que sera visualizado en la grafica
            label: titulo,
            borderColor: colorBG,
            backgroundColor: colorDeLinea,
            data: datosRender.etiquetas.reverse().slice(-10),
          },
        ],
      },
    };

    //Refrescar el grafico

    if (window.chartDOM) {
      window.chartDOM.clear();
      window.chartDOM.destroy();

    }

    window.chartDOM = new Chart(chartDOM, config);
  }
  catch (err) {
    alert("Hubo un fallo en la carga de datos, por favor, reintente")
  }
}

//Petición general a la API
async function getMonedas(url) {
  try {
    const res = await fetch(url);
    const monedas = await res.json();
    return monedas;
  } catch (e) {
    alert("Algo anda mal con la API. Intente nuevamente", e.message);
  }
}

// funcion de conversion de datos de Api 
async function convertir() {
  const currency =moneda.options[moneda.selectedIndex].text.substring(0, 3); 

 if (clp.value == "" || isNaN(clp.value) || clp.value < 100) {
       alert("Debe ingresar un monto valido mayor a 100");
       limpiar();  
 } 
 else {
     try {
       const divisas = await getMonedas(urlAPI);

       resultado.innerHTML = `Resultado: ${new Intl.NumberFormat("de-DE", {
         style: "currency", currency: currency}).format((clp.value / divisas[moneda.value].valor).toFixed(2))}`;

         renderGrafica();
     } 
     catch (err) {
       alert("Algo anda mal. Intente la consulta nuevamente");
     }
 }
}


//Generar los colores de lineas aleatoriamente en cada busqueda
const randomHex = (length) => ("0".repeat(length) + 
                               Math.floor(Math.random() * 16 ** length).toString(16)).slice(-length);

// Limpiar valores mostrados
function limpiar()
{
        clp.value = "";
        resultado.innerHTML="Resultado: ";
        cantidad.innerHTML="Monto a convertir: ";
        window.chartDOM.clear();       
}