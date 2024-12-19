const lletres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let indexLletra1 = 0;
let indexLletra2 = 0;
let temps1 = 60;
let temps2 = 60;
let interval1, interval2;
let equipActiu = 'equip1'; // Equip inicial
let encerts1 = 0, errors1 = 0;
let encerts2 = 0, errors2 = 0;
const MAX_PARAULES = 25; // Límit d'encerts/errors per equip

let finalitzatEquip1 = false; //controlem si un dels equips ha finalitzat
let finalitzatEquip2 = false;

//portem un control de si només està jugant un equip pperquè l'altre ja ha finalitzat
let quedaUnSolEquip = false;

document.addEventListener('DOMContentLoaded', () => 
{
    const rosco1Container = document.querySelector('#rosco1');
    const rosco2Container = document.querySelector('#rosco2');

    generarRosco(rosco1Container, 'equip1');
    generarRosco(rosco2Container, 'equip2');
    marcarLletra(indexLletra1, 'equip1');
    marcarLletra(indexLletra2, 'equip2');
    actualitzarTransparencia(equipActiu);

    // Controls per l'Equip 1
    document.querySelector('#encerta1').addEventListener('click', () => encerta('equip1'));
    document.querySelector('#falla1').addEventListener('click', () => falla('equip1'));
    document.querySelector('#passa1').addEventListener('click', () => passaTorn('equip1', 'equip2'));

    // Controls per l'Equip 2
    document.querySelector('#encerta2').addEventListener('click', () => encerta('equip2'));
    document.querySelector('#falla2').addEventListener('click', () => falla('equip2'));
    document.querySelector('#passa2').addEventListener('click', () => passaTorn('equip2', 'equip1'));

    // Afegir el control per començar el concurs
    document.querySelector('#comencar').addEventListener('click', () => {
        iniciarConcurs();
    });
});

function generarRosco(container, equip) 
{
    const numLletres = lletres.length;
    const angleIncrement = (2 * Math.PI) / numLletres;
    const radius = 250;

    lletres.forEach((lletra, index) => 
    {
        const letterDiv = document.createElement('div');
        letterDiv.classList.add('letter');
        letterDiv.textContent = lletra;
        letterDiv.setAttribute('data-index', index);
        letterDiv.setAttribute('data-equip', equip);

        const angle = index * angleIncrement - Math.PI / 2; // Fa que la "A" estigui a dalt
        const x = radius * Math.cos(angle) + 300 - 30;
        const y = radius * Math.sin(angle) + 300 - 30;

        letterDiv.style.left = `${x}px`;
        letterDiv.style.top = `${y}px`;

        container.appendChild(letterDiv);
    });
}

function marcarLletra(index, equip) 
{
    const letters = document.querySelectorAll(`.letter[data-equip="${equip}"]`);
    letters.forEach(letter => letter.classList.remove('current'));

    letters[index].classList.add('current');
}

function encerta(equip) 
{
    const indexActual = equip === 'equip1' ? indexLletra1 : indexLletra2;
    const lletraActual = document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`);

    // Marcar la lletra com encertada
    lletraActual.classList.add('correct');

    // Actualitzar el recompte d'encerts
    if (equip === 'equip1') 
    {
        encerts1++;
        document.getElementById('encerts1').textContent = `Encerts: ${encerts1}`;
        verificarLimit('equip1');  // Comprovar si l'equip ha arribat al límit
        seleccionarSeguentLletra('equip1');  // Continuar amb la següent lletra de l'equip 1
    } 
    else
    {
        encerts2++;
        document.getElementById('encerts2').textContent = `Encerts: ${encerts2}`;
        verificarLimit('equip2');  // Comprovar si l'equip ha arribat al límit
        seleccionarSeguentLletra('equip2');  // Continuar amb la següent lletra de l'equip 2
    }
}

function falla(equip) 
{
    const indexActual = equip === 'equip1' ? indexLletra1 : indexLletra2;
    const lletraActual = document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`);

    // Marcar la lletra com incorrecta
    lletraActual.classList.add('wrong');

    // Actualitzar el recompte d'errors
    if (equip === 'equip1') 
    {
        errors1++;
        document.getElementById('errors1').textContent = `Errors: ${errors1}`;
        verificarLimit('equip1');
        // Només canviar lletra per l'equip 1 si l'equip 2 no ha fallat
    } 
    else 
    {
        errors2++;
        document.getElementById('errors2').textContent = `Errors: ${errors2}`;
        verificarLimit('equip2');
    }

    // Passar torn a l'altre equip
    passaTorn(equip, equip === 'equip1' ? 'equip2' : 'equip1');  
}



// Passa el torn d'un equip a l'altre i gestiona l'activació de botons
function passaTorn(equipPassa, equipNou) 
{
    // Comprovar si l'equip que rep el torn ja ha acabat
    const contestadesEquipPassa = document.querySelectorAll(`.letter[data-equip="${equipPassa}"].correct, .letter[data-equip="${equipPassa}"].wrong`).length;
    const contestadesEquipNou = document.querySelectorAll(`.letter[data-equip="${equipNou}"].correct, .letter[data-equip="${equipNou}"].wrong`).length;
    //const contestades = document.querySelectorAll(`.letter[data-equip="${equipNou}"].correct, .letter[data-equip="${equipNou}"].wrong`).length;

    if (contestadesEquipNou >= lletres.length) 
    {
        if ((equipNou === 'equip1' && !finalitzatEquip1) || (equipNou === 'equip2' && !finalitzatEquip2)) 
        {
            alert(`L'equip ${equipNou} ja ha acabat el seu rosco.`);
            if (equipNou === 'equip1') finalitzatEquip1 = true;
            if (equipNou === 'equip2') finalitzatEquip2 = true;
        }
        return; // No passar el torn si l'equip ja ha acabat
    }

    if (contestadesEquipPassa >= lletres.length) 
    {
        if ((equipPassa === 'equip1' && !finalitzatEquip1) || (equipPassa === 'equip2' && !finalitzatEquip2)) 
        {
            alert(`L'equip ${equipPassa} ja ha acabat el seu rosco, l'equip ${equipNou} segueix jugant.`);
            if (equipPassa === 'equip1') finalitzatEquip1 = true;
            if (equipPassa === 'equip2') finalitzatEquip2 = true;
        }

        activarBotons(equipNou);
        actualitzarTransparencia(equipNou);
        return;
    }

    // Només seleccionar la següent lletra per l'equip que passa el torn
    seleccionarSeguentLletra(equipPassa); 

    // Actualitzar la transparència de les lletres segons l'equip actiu
    actualitzarTransparencia(equipNou);

    //Reiniciem el cronòmetre de l'equip que acaba de jugar  
    // Iniciar el cronòmetre del nou equip
    iniciarCronometre(equipNou);

    // Desactivar els botons de l'equip que passa el torn i activar els de l'altre equip
    desactivarBotons(equipPassa);
    activarBotons(equipNou);
}





function actualitzarTransparencia(equipActiu) 
{
    const equip1Letters = document.querySelectorAll('.letter[data-equip="equip1"]');
    const equip2Letters = document.querySelectorAll('.letter[data-equip="equip2"]');

    if (equipActiu === 'equip1') 
    {
        equip1Letters.forEach(letter => letter.classList.remove('inactive'));
        equip2Letters.forEach(letter => letter.classList.add('inactive'));
    } 
    else 
    {
        equip1Letters.forEach(letter => letter.classList.add('inactive'));
        equip2Letters.forEach(letter => letter.classList.remove('inactive'));
    }
}

function actualitzarTemps(equip) 
{
    if (equip === 'equip1' && equipActiu === 'equip1') 
    {
        temps1--;
        document.getElementById('timer1').textContent = `Temps: ${temps1}s`;
        if (temps1 <= 0) {
            clearInterval(interval1);
            alert('Temps esgotat per l\'Equip 1!');
            passaTorn('equip1', 'equip2');
        }
    } else if (equip === 'equip2' && equipActiu === 'equip2') 
        {
        temps2--;
        document.getElementById('timer2').textContent = `Temps: ${temps2}s`;
        if (temps2 <= 0) {
            clearInterval(interval2);
            alert('Temps esgotat per l\'Equip 2!');
            passaTorn('equip2', 'equip1');
        }
    }
}

function iniciarCronometre(equip) 
{
    const timerElement = document.getElementById(`timer${equip === 'equip1' ? '1' : '2'}`);
    let temps = 60; // Iniciar amb 60 segons

    // Actualitzar el cronòmetre cada segon
    const interval = setInterval(() => 
    {
        temps--;
        timerElement.textContent = `Temps: ${temps}s`;

        if (temps <= 0) {
            clearInterval(interval);
            alert(`El temps s'ha acabat per a l'equip ${equip}!`);
            // Passar torn
            passaTorn(equip, equip === 'equip1' ? 'equip2' : 'equip1');
        }
    }, 1000);

    // Aturar el cronòmetre de l'altre equip si està en marxa
    if (equip === 'equip1') 
    {
        clearInterval(interval2); // Atura el cronòmetre de l'equip 2
        interval1 = interval; // Assignar el nou interval a interval1
    } 
    else 
    {
        clearInterval(interval1); // Atura el cronòmetre de l'equip 1
        interval2 = interval; // Assignar el nou interval a interval2
    }
}

function iniciarConcurs() 
{
    // Iniciar temporitzador per a l'equip 1, ja que és l'equip inicial
    iniciarCronometre('equip1');
    
    // Desactivar el botó de començar per evitar que es torni a prémer
    document.querySelector('#comencar').disabled = true;
}

function reiniciarJoc() 
{
    // Restableix els valors de les variables
    encerts1 = 0;
    errors1 = 0;
    encerts2 = 0;
    errors2 = 0;
    indexLletra1 = 0; // Torna a la lletra 'A'
    indexLletra2 = 0; // Torna a la lletra 'A'

    // Actualitzar la interfície
    document.getElementById('encerts1').textContent = `Encerts: ${encerts1}`;
    document.getElementById('errors1').textContent = `Errors: ${errors1}`;
    document.getElementById('encerts2').textContent = `Encerts: ${encerts2}`;
    document.getElementById('errors2').textContent = `Errors: ${errors2}`;

    // Reiniciar les lletres
    const lletres = document.querySelectorAll('.letter');
    lletres.forEach(lletra => 
    {
        lletra.classList.remove('correct', 'wrong');
    });

    // Reiniciar els cronòmetres
    clearInterval(interval1);
    clearInterval(interval2);

    // Marcar la lletra 'A' com activa per a l'equip 1
    marcarLletra(indexLletra1, 'equip1');
    
    // Marcar la lletra 'A' com activa per a l'equip 2
    marcarLletra(indexLletra2, 'equip2');

    // Reiniciar el color de les lletres actives
    actualitzarTransparencia('equip1'); // Seleccionar l'equip 1 com a actiu

    // Assignar l'equip 1 com a l'equip actiu
    equipActiu = 'equip1';
}

function verificarLimit(equip) 
{
    // Comprovar les lletres encertades i fallades
    const letters = document.querySelectorAll(`.letter[data-equip="${equip}"]`);
    let contestades = 0;

    letters.forEach(letter => 
    {
        if (letter.classList.contains('correct') || letter.classList.contains('wrong')) 
        {
            contestades++;
        }
    });

    // Si s'han contestat totes les lletres (encertades o fallades)
    if (contestades >= lletres.length) 
    {
         //només s'ha de mostrar la primera vegada:
        if ((equip === 'equip1' && !finalitzatEquip1) || (equip === 'equip2' && !finalitzatEquip2)) 
        {
            if (equip === 'equip1') finalitzatEquip1 = true; //actualitzem la variable d'equip finalitzat
            if (equip === 'equip2') finalitzatEquip2 = true;

            //Forcem l'actualització del DOM abans de mostrar l'alerta
            setTimeout(() => 
            {
                alert(`L'equip ${equip} ha finalitzat!`);
            }, 0);
        }

        desactivarBotons(equip);  // Desactivar els botons de l'equip que ha arribat al final
        
        // Comprovar si l'altre equip també ha acabat
        const equipAltres = equip === 'equip1' ? 'equip2' : 'equip1';
        const altresContestades = document.querySelectorAll(`.letter[data-equip="${equipAltres}"].correct, .letter[data-equip="${equipAltres}"].wrong`).length;

        // Si l'altre equip també ha acabat, el joc s'acaba
        if (altresContestades >= lletres.length) 
        {
            alert('El joc ha acabat!');
        }

        else //si l'altre equip no ha finalitzat
        {
            if (equipActiu === equip) 
            {
                equipActiu = equipAltres; //canviem d'equip perquè l'equip actiu ha acabat.
                activarBotons(equipAltres);
                actualitzarTransparencia(equipAltres);
            }
        }
    }
}

// Selecciona la següent lletra no encertada de l'equip actual
function seleccionarSeguentLletra(equip) 
{
    let indexActual = equip === 'equip1' ? indexLletra1 : indexLletra2;
    let intents=0;

    // Seleccionar la següent lletra que no hagi estat encertada o fallada
    do {
        indexActual = (indexActual + 1) % lletres.length; // Avançar a la següent lletra
        intents++; //
        if (intents > lletres.length) //perquè no es quedi en un bucle infinit si un equip acaba el rosco
        {
            console.warn(`Totes les lletres han estat contestades per ${equip}, no es pot seleccionar cap altra lletra.`);
            return; // Sortir de la funció per evitar bucle infinit
        }
    } while (
        document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`).classList.contains('correct') || 
        document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`).classList.contains('wrong')
    );

    // Actualitzar l'índex corresponent
    if (equip === 'equip1') 
    {
        indexLletra1 = indexActual;
    } 
    else 
    {
        indexLletra2 = indexActual;
    }

    marcarLletra(indexActual, equip);
}

// Desactiva els botons de l'equip especificat
function desactivarBotons(equip) 
{
    document.querySelector(`#encerta${equip === 'equip1' ? 1 : 2}`).disabled = true;
    document.querySelector(`#falla${equip === 'equip1' ? 1 : 2}`).disabled = true;
    document.querySelector(`#passa${equip === 'equip1' ? 1 : 2}`).disabled = true;
}

// Activa els botons de l'equip especificat
function activarBotons(equip) 
{
    document.querySelector(`#encerta${equip === 'equip1' ? 1 : 2}`).disabled = false;
    document.querySelector(`#falla${equip === 'equip1' ? 1 : 2}`).disabled = false;
    document.querySelector(`#passa${equip === 'equip1' ? 1 : 2}`).disabled = false;
}

// Event listener per al botó de reinici
document.getElementById('reset').addEventListener('click', reiniciarJoc);
