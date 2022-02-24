/**-------------------------------------
 *              start
 -------------------------------------*/
const game_title = "Route Planner";
const game_title2 = "saved games:";
const mobile_alert ="Route Planner is developed for desktop. For the best experience, consider using your laptop/pc!";
const create_game_Placeholder ="Game XY";
const create_game_text ="Enter Game Name";
const createNewGame_title = "Create a new game!";
const alert_game_name = "Don't forget to name your experiment!";
const continue_button = "continue game";
const cancel = "cancel";
const delete_ ="delete";
const create ="create";
const delete_question ="Are you sure?";
const delete_text ="Do you really want to delete your saved game: <b>%TITLE%</b>? This process cannot be undone.";

/**-------------------------------------
 *              level
 -------------------------------------*/
//TODO level text

/**-------------------------------------
 *              selection
 -------------------------------------*/
//TODO selection text

/**-------------------------------------
 *              simulation
 -------------------------------------*/
//TODO simulation text

/**-------------------------------------
 *              robots
 -------------------------------------*/

const robotColors = ["", "#f3dd7e", "#88c56e", "#6eb4c5", "#c56e6e", "#999999", "#999999"];
const robotNames = ["", "Random", "RandomMemory", "RandomMemoryDeadEnd", "Shortest", "Compass", "Dijksta"];
const robotDescriptions = [
    "",
    "Randomly chooses next path.",
    "Randomly chooses next path, but never takes a path twice.",
    "Randomly chooses next path, but never takes a path twice. If stuck at a dead-end takes a step back and trys again.",
    "Always chooses the shortest path, but never takes a road twice. If stuck at a dead-end takes a step back and trys again.",
    "Always chooses the path pointing to the destination the most, but never takes a road twice. If stuck at a dead-end takes a step back and trys again.",
    "depth",
    "dijkstra"];
const robotCodeLines=[
    ``,
    `<pre><code>
1 Repeat while destination not reached
2     find possible paths   
3      randomly choose one of the found paths
    </code></pre>`,
`<pre><code>
1 Repeat while destination not reached
2     find possible paths but ignore those already taken 
3     randomly choose one of the found paths
    </code></pre>`,
    `<pre><code>
1 Repeat while destination not reached
2     find possible paths but ignore those already taken 
3     if no paths possible 
4         take a step back
5     else 
6         randomly choose one of the found paths

    </code></pre>`,
`<pre><code>
1 Repeat while destination not reached
2     find possible paths but ignore those already taken
3     if there are no possible paths
4          take a step back
5          start from top
6     else
7          take shortest path
    </code></pre>`,
    `<pre><code>
1 Repeat while destination not reached
2     find possible paths but ignore those already taken
3     if there are no possible paths
4          take a step back
5          start from top
6     else
7          take shortest path
take path that points on the right direction
    </code></pre>`,
    `<pre><code>
depth
    </code></pre>`,
    `<pre><code>
dijkstra
    </code></pre>`]

/**-------------------------------------
 *              story
 -------------------------------------*/
const levelIntros = [
    "",
    "Hello DEVO! My name is Doctor Braino and I am an inventor. I just created you and was hoping you could help me deliver some packages. <br><br><span style=\"color:#f3dd7e;\"><b>\"Hi Doctor Braino, happy to help\" - DEVO </b></span><br><br> I do not know the route to your destination, just try some random paths and, I am sure you will find your way eventually." ,
    "Oh no, DEVO! You took some paths multiple times. <br><br><span style=\"color:#88c56e;\"><b>\"Really I do not remember going anywhere!\" - DEVO </b></span><br><br> I will give you some memory, take note of which paths you take and don't take the same path twice, maybe this way you will be faster finding your next destination",
    "Finally, I found you, why have you stopped DEVO? <br><br><span style=\"color:#6eb4c5;\"><b>\"You told me not to walk a path twice and there are no paths left.\" - DEVO  </b></span><br><br> Oh no looks like you got stuck in a dead-end DEVO. If that ever happens take one step/path back and try again.",
    "DEVO, you often take a long detour to find the destination. <br><br><span style=\"color:#88c56e;\"><b>\"How can I know which path is faster?\" - DEVO </b></span><br><br> Here, I give you a sensor that helps you measure distances. You can measure the possible paths and always take the shortest one. Never forget about what you have already learned: No paths twice and if you are stuck take a step/path back.",
    "Sometimes the shortest paths lead into the wrong direction. <br><br><span style=\"color:#88c56e;\"><b>\"How can I know which path leads me in the wrong direction?\" - DEVO </b></span><br><br> Let me give you a compass, it helps you measure the direction to your goal using the cardinal points: North,East, South and West. Use it to compare with the directions of the possible paths and take the most similar one and remember: No paths twice and if you are stuck take a step/path back.",
    "<br><br><span style=\"color:#88c56e;\"><b>\"Choosing which path to take is really difficult, so much to think about distance, direction or always choosing a random one.\" - DEVO </b></span><br><br> Lets make the path selection simpler. Always take the first path on your list of possible paths and remember: No paths twice and if you are stuck take a step/path back.",
    "Dijkstra"]

const levelIntrosShort = [
    "",
    "DEVO should randomly chose roads to find its destination.",
    "DEVO should randomly chose roads to find its destination but not take any road twice.",
    "DEVO should randomly chose roads to find its destination but not take any road twice. If DEVO is at a dead-end he should take a step back.",
    "DEVO should take the shortest road but not take any road twice. If DEVO is at a dead-end he should take a step back.",
    "DEVO should take the road which points in the right direction but not take any road twice. If DEVO is at a dead-end he should take a step back.",
    "Depth-first take always the first road but never one twice. Anytime you get stuck take a step back and try the same again.",
    "Dijkstra"]

const introQuestions = [
    null,
    {Question:"Will DEVO be able to find his destination?",
        correctAnswer:"Yes",
        wrongAnswers:["No","Maybe"]
    },
    {Question:"Will DEVO be able to find his destination?",
        correctAnswer:"Maybe",
        wrongAnswers:["No","Yes"]
    },
    {Question:"Will DEVO be able to find his destination?",
        correctAnswer:"Yes",
        wrongAnswers:["No","Maybe"]
    },
    {Question:"Will DEVO be able to find his destination?",
        correctAnswer:"Yes",
        wrongAnswers:["No","Maybe"]
    },
    {Question:"Will DEVO be able to find his destination?",
        correctAnswer:"Yes",
        wrongAnswers:["No","Maybe"]
    },
    {Question:"Will DEVO be able to find his destination?",
        correctAnswer:"Yes",
        wrongAnswers:["No","Maybe"]
    },
    {Question:"Will DEVO be able to find his destination?",
        correctAnswer:"Yes",
        wrongAnswers:["No","Maybe"]
    },
]

const middleQuestions = [
    null,
    {Question:"Which path will DEVO take next?",
        correctAnswer:"DEVO take a random path.",
        wrongAnswers:["DEVO will take a step back.","DEVO will always take the shortest path possible.","DEVO will always take the longest path possible.","DEVO will always take the path possible which most points into the direction of the destination.","DEVO will stop."]
    },
   //dead end
    {Question:"Which path will DEVO take next?",
        correctAnswer:"DEVO will stop.",
        wrongAnswers:["DEVO will take a step back.","DEVO take a random path.","DEVO will always take the shortest path possible.","DEVO will always take the longest path possible.","DEVO will always take the path possible which most points into the direction of the destination."]
    },
    //dead end
    {Question:"Which path will DEVO take next?",
        correctAnswer:"DEVO will go a step back",
        wrongAnswers:["DEVO will stop.","DEVO take a random path.","DEVO will always take the shortest path possible.","DEVO will always take the longest path possible.","DEVO will always take the path possible which most points into the direction of the destination."]
    },
    {Question:"Which path will DEVO take next?",
        correctAnswer:"DEVO will always take the shortest path possible.",
        wrongAnswers:["DEVO will stop.","DEVO take a random path.","DEVO will always take a random path.","DEVO will always take the longest path possible.","DEVO will always take the path possible which most points into the direction of the destination."]
    },
    {Question:"Which path will DEVO take next?",
        correctAnswer:"DEVO will always take the path possible which most points into the direction of the destination.",
        wrongAnswers:["DEVO will stop.","DEVO take a random path.","DEVO will go a step back","DEVO will always take a random path.","DEVO will always take the longest path possible."]
    },
    {Question:"Which path will DEVO take next?",
        correctAnswer:"DEVO will take the first path in the list of possible paths or take a step back.",
        wrongAnswers:["DEVO will stop.","DEVO take a random path.","DEVO will go a step back","DEVO will always take a random path.","DEVO will always take the longest path possible.","DEVO will always take the path possible which most points into the direction of the destination."]
    },
    {Question:"Q2",
        correctAnswer:"A",
        wrongAnswers:["B","c","D","E","F"]
    }
]

const finalQuestion = [
    null,
    {Question:"Why did DEVO go some paths multiple times?",
        correctAnswer:"DEVO did not remember walking on those paths before.",
        wrongAnswers:["DEVO liked the paths.","DEVO was told to walk paths multiple times.","DEVO remembered the path"]
    },
    {Question:"Why did DEVO stopped moving?",
        correctAnswer:"DEVO can't take paths twice, so he got stuck at a dead end.",
        wrongAnswers:["DEVO was tired.","DEVO thought he was at the destination."]
    },
    {Question:"Will DEVO always find the fastest route this way?",
        correctAnswer:"No, he may find the perfect route by accent but not always.",
        wrongAnswers:["Yes, he will always find the fastest route.","No, he will never find the fastest route."]
    },
    {Question:"Will DEVO always find the shortest route this way?",
        correctAnswer:"No, the shortest paths may lead to more steps in total.",
        wrongAnswers:["Yes, he will always find the shortest route.","No, he will never find the shortest route."]
    },
    {Question:"Will DEVO always find the fastest route this way?",
        correctAnswer:"No, he may has to take some steps back get to his destination.",
        wrongAnswers:["Yes, he will always find the fastest route.","No, he will never find the fastest route."]
    },
    {Question:"Will DEVO always find the fastest route this way?",
        correctAnswer:"No, he will always find his destination but not the fastest.",
        wrongAnswers:["Yes, he will always find the shortest route.","No, he will never find the shortest route."]
    },
    {Question:"Q2",
        correctAnswer:"A",
        wrongAnswers:["B","c","D","E","F"]
    }
]