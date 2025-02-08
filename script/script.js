const lletres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
let indexLletra1 = 0;
let indexLletra2 = 0;
let temps1 = 60;
let temps2 = 60;
let interval1, interval2;
let equipActiu = 'equip1'; //Equip inicial
let encerts1 = 0, errors1 = 0;
let encerts2 = 0, errors2 = 0;
const MAX_PARAULES = 25; //Límit d'encerts/errors per equip (nombre de lletres del "rosco")

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

    //Controls per l'Equip 1
    document.querySelector('#encerta1').addEventListener('click', () => encerta('equip1'));
    document.querySelector('#falla1').addEventListener('click', () => falla('equip1'));
    document.querySelector('#passa1').addEventListener('click', () => passaTorn('equip1', 'equip2'));

    //Controls per l'Equip 2
    document.querySelector('#encerta2').addEventListener('click', () => encerta('equip2'));
    document.querySelector('#falla2').addEventListener('click', () => falla('equip2'));
    document.querySelector('#passa2').addEventListener('click', () => passaTorn('equip2', 'equip1'));

    //Afegir el control per començar el concurs
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

        const angle = index * angleIncrement - Math.PI / 2; //Fa que la "A" estigui a dalt
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

    //Marcar la lletra com encertada
    lletraActual.classList.add('correct');

    //Actualitzar el recompte d'encerts
    if (equip === 'equip1') 
    {
        encerts1++;
        document.getElementById('encerts1').textContent = `Encerts: ${encerts1}`;
        verificarLimit('equip1'); //Commprovem si l'equip ha arribat al límit
        seleccionarSeguentLletra('equip1');   //Continuem amb la següent lletra de l'equip 1
    } 
    else
    {
        encerts2++;
        document.getElementById('encerts2').textContent = `Encerts: ${encerts2}`;
        verificarLimit('equip2');  //Commprovem si l'equip ha arribat al límit
        seleccionarSeguentLletra('equip2');  //Continuem amb la següent lletra de l'equip 2
    }
}

function falla(equip) 
{
    const indexActual = equip === 'equip1' ? indexLletra1 : indexLletra2;
    const lletraActual = document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`);

    //Marquem la lletra com incorrecta
    lletraActual.classList.add('wrong');

    //Actualitzem el recompte d'errors
    if (equip === 'equip1') 
    {
        errors1++;
        document.getElementById('errors1').textContent = `Errors: ${errors1}`;
        verificarLimit('equip1');
        //només canviar lletra per l'equip 1 si l'equip 2 no ha fallat
    } 
    else 
    {
        errors2++;
        document.getElementById('errors2').textContent = `Errors: ${errors2}`;
        verificarLimit('equip2');
    }

    //només passarà torn a l'altre equip si tots dos equips segueixen jugant:
    if(quedaUnSolEquip)
    {
        seleccionarSeguentLletra(equip);
    }
    else
    {
         //PAssem el torn a l'altre equip
        passaTorn(equip, equip === 'equip1' ? 'equip2' : 'equip1');  
    }
   
}

//Passa el torn d'un equip a l'altre i gestiona l'activació de botons
function passaTorn(equipPassa, equipNou) 
{
     //Reiniciem crono a 60s
     if (equipPassa === 'equip1') 
    {
        clearInterval(interval1); //aturem crono equip 1
        temps1 = 60; //reiniciem el temps
        document.getElementById('timer1').textContent = `Temps: ${temps1}s`; //actualitzem el valor a la interfície
    } 
    else 
    {
        clearInterval(interval2); //aturem crono equip2
        temps2 = 60; //reiniciem el temps
        document.getElementById('timer2').textContent = `Temps: ${temps2}s`; //actualitzem el valor a la interfície
    }

    if (quedaUnSolEquip) //si només queda un equip
    {
        //continua jugant
        seleccionarSeguentLletra(equipPassa);
        return;
    }

    //Comprovem si l'equip que rep el torn ja ha acabat
    const contestadesEquipPassa = document.querySelectorAll(`.letter[data-equip="${equipPassa}"].correct, .letter[data-equip="${equipPassa}"].wrong`).length;
    const contestadesEquipNou = document.querySelectorAll(`.letter[data-equip="${equipNou}"].correct, .letter[data-equip="${equipNou}"].wrong`).length;

    if (contestadesEquipNou >= lletres.length) 
    {
        if ((equipNou === 'equip1' && !finalitzatEquip1) || (equipNou === 'equip2' && !finalitzatEquip2)) 
        {
            alert(`L'equip ${equipNou} ja ha acabat el seu rosco.`);
            if (equipNou === 'equip1') finalitzatEquip1 = true;
            if (equipNou === 'equip2') finalitzatEquip2 = true;
        }
        return; //No passa el torn el si l'equip ja ha acabat
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

    if(quedaUnSolEquip)
    {
        seleccionarSeguentLletra(equipPassa);
        return;
    }

    //Només seleccionem la següent lletra per l'equip que passa el torn
    seleccionarSeguentLletra(equipPassa); 

    //Actualitzem la transparència de les lletres segons l'equip actiu
    actualitzarTransparencia(equipNou);

    //Reiniciem el cronòmetre de l'equip que acaba de jugar  
    //Iniciem el cronòmetre del nou equip
    iniciarCronometre(equipNou);

    //Desactivem els botons de l'equip que passa el torn i activar els de l'altre equip
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
    } 
    else if (equip === 'equip2' && equipActiu === 'equip2') 
    {
        temps2--;
        document.getElementById('timer2').textContent = `Temps: ${temps2}s`;
        if (temps2 <= 0) 
        {
            clearInterval(interval2);
            alert('Temps esgotat per l\'Equip 2!');
            passaTorn('equip2', 'equip1');
        }
    }
}

function iniciarCronometre(equip) 
{
    const timerElement = document.getElementById(`timer${equip === 'equip1' ? '1' : '2'}`);
    let temps = 60; //Iniciem amb 60 segons

    //Actualitzem el cronòmetre cada segon
    const interval = setInterval(() => 
    {
        temps--;
        timerElement.textContent = `Temps: ${temps}s`;

        if (temps <= 0) 
        {
            clearInterval(interval);
            alert(`El temps s'ha acabat per a l'equip ${equip}!`);
            //PAssem torn
            passaTorn(equip, equip === 'equip1' ? 'equip2' : 'equip1');
        }
    }, 1000);

    //Aturem el cronòmetre de l'altre equip si està en marxa
    if (equip === 'equip1') 
    {
        clearInterval(interval2); //Aturem  el cronòmetre de l'equip 2
        interval1 = interval; //Assignem el nou interval a interval1
    } 
    else 
    {
        clearInterval(interval1); //Aturem el cronòmetre de l'equip 1
        interval2 = interval; //Assignem el nou interval a interval2
    }
}

function iniciarConcurs() 
{
    //Iniciem el temporitzador per a l'equip 1, ja que és l'equip inicial
    iniciarCronometre('equip1');
    
    //Desactivem el botó de començar per evitar que es torni a prémer
    document.querySelector('#comencar').disabled = true;
}

function reiniciarJoc() 
{
    //Restablim els valors de les variables
    encerts1 = 0;
    errors1 = 0;
    encerts2 = 0;
    errors2 = 0;
    indexLletra1 = 0; //Tornem a la lletra 'A'
    indexLletra2 = 0; //Tornem a la lletra 'A'

    //Actualitzem la interfície
    document.getElementById('encerts1').textContent = `Encerts: ${encerts1}`;
    document.getElementById('errors1').textContent = `Errors: ${errors1}`;
    document.getElementById('encerts2').textContent = `Encerts: ${encerts2}`;
    document.getElementById('errors2').textContent = `Errors: ${errors2}`;

    //Reiniciem les lletres
    const lletres = document.querySelectorAll('.letter');
    lletres.forEach(lletra => 
    {
        lletra.classList.remove('correct', 'wrong');
    });

    //REiniciem els cronòmetres
    clearInterval(interval1);
    clearInterval(interval2);

    //Marquem la lletra 'A' com activa per a l'equip 1
    marcarLletra(indexLletra1, 'equip1');
    
    //Marquem la lletra 'A' com activa per a l'equip 2
    marcarLletra(indexLletra2, 'equip2');

    //Reiniciem el color de les lletres actives
    actualitzarTransparencia('equip1'); //Seleccione,m l'equip 1 com a actiu

    //Assignem l'equip 1 com a l'equip actiu
    equipActiu = 'equip1';
}

function verificarLimit(equip) 
{
    //Comprovem les lletres encertades i fallades
    const letters = document.querySelectorAll(`.letter[data-equip="${equip}"]`);
    let contestades = 0;

    letters.forEach(letter => 
    {
        if (letter.classList.contains('correct') || letter.classList.contains('wrong')) 
        {
            contestades++;
        }
    });

    //SI han contestat totes les lletres (encertades o fallades)
    if (contestades >= lletres.length) 
    {
         //només s'ha de mostrar la primera vegada:
        if ((equip === 'equip1' && !finalitzatEquip1) || (equip === 'equip2' && !finalitzatEquip2)) 
        {
            alert(`L\'equip ${equip} ha finalitzat!`);

            if (equip === 'equip1') finalitzatEquip1 = true; //actualitzem la variable d'equip finalitzat
            if (equip === 'equip2') finalitzatEquip2 = true;

            //si un dels dos equips ha acabat:
            if( finalitzatEquip1 || finalitzatEquip2)
            {
                //actualitzem la variable que ens indica que només hi ha un equip jugant:
                quedaUnSolEquip=true;
            }    
        }

        desactivarBotons(equip);  //desactivem els botons de l'equip que ha arribat al final
        
        //comprovem si l'altre equip també ha acabat
        const equipAltres = equip === 'equip1' ? 'equip2' : 'equip1';
        const altresContestades = document.querySelectorAll(`.letter[data-equip="${equipAltres}"].correct, .letter[data-equip="${equipAltres}"].wrong`).length;

        //Si l'altre equip també ha acabat, el joc s'acaba
        if (altresContestades >= lletres.length) 
        {
            //marquem la darrera lletra correctament:
            const indexActual=equip==='equip1'? indexLletra1 : indexLletra2;
            const lletraActual=document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`);
            
            //marquel la darrera lletra segons si és OK o KO:
            if(!lletraActual.classList.contains('correct')&&!lletraActual.classList.contains('wrong'))
            {
                lletraActual.classList.add('wrong');
            }
                setTimeout(() =>  //fem timeout perquè si no mostra l'alerta abans de pintar la lletra corresponent
                {
                    alert('El joc ha acabat!');
                    let guanyador = quiguanya();
                    alert("L'equip guanyador és " + guanyador);
                }, 0);
        }

        else //si l'altre equip no ha finalitzat
        {
            //Després de finalitzar l'equip, activem l'altre
            if (!finalitzatEquip1 || !finalitzatEquip2) 
            {
                activarBotons(equipAltres);
                actualitzarTransparencia(equipAltres);
            }
        }
    }
}

//Seleccionem la següent lletra no encertada de l'equip actual
function seleccionarSeguentLletra(equip) 
{
    let indexActual = equip === 'equip1' ? indexLletra1 : indexLletra2;
    let intents=0;

    //Seleccionem la següent lletra que no hagi estat encertada o fallada
    do 
    {
        indexActual = (indexActual + 1) % lletres.length; //Avancem a la següent lletra
        intents++; //
        if (intents > lletres.length) //perquè no es quedi en un bucle infinit si un equip acaba el rosco
        {
            console.warn(`Totes les lletres han estat contestades per ${equip}, no es pot seleccionar cap altra lletra.`);
            return; //Sortim de la funció per evitar bucle infinit
        }
    } while (
        document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`).classList.contains('correct') || 
        document.querySelector(`.letter[data-equip="${equip}"][data-index="${indexActual}"]`).classList.contains('wrong')
    );

    //ACtualtizem l'índex corresponent
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

//Desacrtivem els botons de l'equip especificat
function desactivarBotons(equip) 
{
    document.querySelector(`#encerta${equip === 'equip1' ? 1 : 2}`).disabled = true;
    document.querySelector(`#falla${equip === 'equip1' ? 1 : 2}`).disabled = true;
    document.querySelector(`#passa${equip === 'equip1' ? 1 : 2}`).disabled = true;
}

//ACtivem els botons de l'equip especificat
function activarBotons(equip) 
{
    document.querySelector(`#encerta${equip === 'equip1' ? 1 : 2}`).disabled = false;
    document.querySelector(`#falla${equip === 'equip1' ? 1 : 2}`).disabled = false;
    document.querySelector(`#passa${equip === 'equip1' ? 1 : 2}`).disabled = false;
}

//Event listener per al botó de reinici
document.getElementById('reset').addEventListener('click', reiniciarJoc);

//Funció que determina qui guanya:
function quiguanya()
{
    let equipGuanyador;

    //retornarà el valor de l'equip guanyador
    //guanya qui més encerts i menys errors tingui
    (encerts1>encerts2)? equipGuanyador="EQUIP 1": equipGuanyador="EQUIP 2";
    return equipGuanyador;
}


//Per mostrar o amagar les seccions //
function mostrarSeccio(idSeccio) 
{
    //D'inici, totes les seccions es troben amagades:
    const seccions = document.querySelectorAll('.seccio');
    seccions.forEach(seccio => 
    {
        seccio.classList.remove('visible');
        seccio.classList.add('ocult');
    });

     //Mostrem la capa de fons
     document.querySelector('.fons').style.display = 'block';

    //Mostrem la seccio seleccionada:
    const seccioAMostrar = document.getElementById(idSeccio);
    seccioAMostrar.classList.add('visible');
    seccioAMostrar.classList.remove('ocult');
    seccioAMostrar.scrollIntoView({ behavior: 'smooth' });
}

// Amagar secció i capa de fons
document.querySelector('.fons').addEventListener('click', () => 
{
    document.querySelectorAll('.seccio').forEach(seccio =>
    {
        seccio.classList.remove('visible');
        seccio.classList.add('ocult');
    });
    document.querySelector('.fons').style.display = 'none';
});

document.querySelectorAll('.tancar').forEach(btn => 
{
    btn.addEventListener('click', () => {
        document.querySelector('.fons').style.display = 'none';
        document.querySelectorAll('.seccio').forEach(seccio =>
        {
            seccio.classList.remove('visible');
            seccio.classList.add('ocult');
        });
    });
});

// Enllaços de navegació
document.getElementById('instruccions_link').addEventListener('click', () => mostrarSeccio('instruccions'));
document.getElementById('sobre_link').addEventListener('click', () => mostrarSeccio('sobre'));
document.getElementById('llicencia_link').addEventListener('click', () => mostrarSeccio('llicencia'));
document.getElementById('contribueix_link').addEventListener('click', () => mostrarSeccio('contribueix'));

/*************************************PER FER
    - Acabar de retocar la finalització dels cronòmetres quan passa de torn
    - 
*/