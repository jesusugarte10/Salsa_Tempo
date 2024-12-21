export const salsa_figures = {
    "Guapea": [
        {"name": "Sombrero", "count": 16},
        {"name": "Kentucky", "count": 24},
        {"name": "Adios con la vecina", "count": 16},
        {"name": "Caracol", "count": 32},
        {"name": "Setenta", "count": 32},
        {"name": "Pa Ti Pa Mi", "count": 24},
        {"name": "Dame", "count": 8},
        {"name": "Dame Dos", "count": 8},
        {"name": "Fly", "count": 8},
        {"name": "Echeveria", "count": 8},
        {"name": "Besito", "count": 24},
        {"name": "Patin", "count": 24},
        {"name": "Patineta", "count": 24},
        {"name": "Cucaracha", "count": 8},
        {"name": "Selfie", "count": 8},
        {"name": "Una Bulla", "count": 8},
        {"name": "Enchufla", "count": 16},
        {"name": "Enchufla Doble", "count": 24},
        {"name": "Enchufla Con Mambo", "count": 24},
        {"name": "Siete con Cocacola", "count": 16},
        {"name": "Festival de Pelotas", "count": 48},
        {"name": "Balsero", "count": 24},
        {"name": "El dedo", "count": 32},
        {"name": "Espresso", "count": 24},
        {"name": "Babosa", "count": 24},
    ],
    "Arriba": [
        {"name": "Exibela", "count": 8},
        {"name": "Toro", "count": 8},
        {"name": "Toro de Mentira", "count": 8},
    ]
};

export const switchGroup = (currentGroup) =>{
    if (currentGroup === "Guapea") {
        currentGroup = "Arriba";
        return [{ name: "Dile que no y Arriba", count: 8 }, currentGroup];
    } else {
        currentGroup = "Guapea";
        return { "name": "Dile que no", "count": 8 , "currentGroup": currentGroup};
    }
}

export const getRandomSalsaFigure = (currentGroup) => {
    const figures = salsa_figures[currentGroup] || [];
    if (figures.length === 0) {
        console.warn(`No figures found for group: ${currentGroup}`);
        return null;
    }

    //Change Group Randomness
    if (Math.random() < (currentGroup === "Arriba" ? 0.7 : 0.005)) {
        return switchGroup(currentGroup);
    }
    else{
        return { ...figures[Math.floor(Math.random() * figures.length)], "currentGroup": currentGroup };
    }

};