export const genres = ["Romance", "Comedy", "Thriller", "Mystery"] as const;
export type Genre = (typeof genres)[number];
export type Section = { title: string; paragraphs: string[] };
export type Book = {
  id: string;
  title: string;
  genre: Genre;
  blurb: string;
  cover: number;
  sections: Section[];
  words: number;
  minutes: number;
};

function story(
  id: string,
  title: string,
  genre: Genre,
  blurb: string,
  cover: number,
  chapters: [string, string][],
): Book {
  const sections = chapters.map(([heading, prose]) => ({
    title: heading,
    paragraphs: prose
      .trim()
      .split(/\n\s*\n/)
      .map((p) => p.trim()),
  }));
  const words = sections.reduce(
    (sum, s) => sum + s.paragraphs.join(" ").split(/\s+/).length,
    0,
  );
  return {
    id,
    title,
    genre,
    blurb,
    cover,
    sections,
    words,
    minutes: Math.ceil(words / 200),
  };
}

export const books: Book[] = [
  story(
    "last-light",
    "The Last Light on Willow Street",
    "Romance",
    "Two neighbors, one borrowed lamp, and all the things a window can say.",
    0,
    [
      [
        "A borrowed light",
        `On the evening the power failed, Mara discovered that her new apartment contained seventeen candles and no matches. She had inherited the candles from her aunt, who believed every inconvenience could be improved by a pleasant smell. The candles smelled of pears. The apartment smelled of rain.

Across Willow Street, a single window glowed. A man sat beside a brass lamp, repairing something small. Mara put on her coat, crossed the street, and knocked on the blue door beneath the window. The man answered with a watchmaker's lens still caught in his hair.

“Matches?” she asked. “Or advice on rubbing two scented candles together.”

He laughed and handed her the lamp. It was powered by a battery hidden inside its heavy base. “Bring it back tomorrow. I have a second one.”

His name was Eli. On her way home, Mara noticed his window had gone dark. She returned immediately. There was no second lamp. He admitted this with the embarrassed dignity of a person caught doing something kind. They carried the lamp back across the street and put it between two cups of tea.

Mara had moved to town to paint signs for the little shops along the river. Eli repaired clocks, although he said that most of his work was listening to people explain why a particular clock mattered. Neither mentioned being lonely. They discussed stubborn hinges, terrible weather, and the bakery that refused to sell yesterday's bread until it became today's pudding.`,
      ],
      [
        "The window",
        `The electricity returned at midnight. Neither moved to turn on a light.

In the following weeks, the lamp became an excuse with a handle. Mara borrowed it to paint a difficult letter. Eli borrowed it to photograph a repaired watch. Sometimes they met halfway across the street and stood talking until a driver politely reminded them that the road was still a road.

Then a letter arrived offering Mara a permanent position in a city three hours away. It paid more than signs and included an office whose windows never needed painting. She put the letter under the lamp and told Eli about it over tea.

“You should go if you want to,” he said.

She heard the silence after the sentence more clearly than the sentence itself. For three days they were careful with each other. The lamp stayed in Mara's apartment. Eli's window remained dark, although she knew perfectly well he had bought another battery light.

On Thursday, Mara found a parcel at her door. Inside was a small clock with an unpainted wooden face. A note said: Whatever you decide, I thought you might like to choose the numbers yourself.

She painted flowers where the hours should have been. At seven, she crossed the street with the clock and the letter. She had declined the job. There was enough work here, she explained, and she preferred windows that opened. But she did not want him to mistake staying for an answer to a question he had never asked.

Eli set down the clock. “Would you have dinner with me? With the lights on, so there can be no confusion?”

“Yes,” Mara said. “Although I like the lamp.”

Years later, when the street lost power again, two windows stayed bright. Between them, people carried soup, spare batteries, and news. In one apartment a clock bloomed twelve times a day. In the other, two cups waited beside a brass lamp that no longer needed to travel very far.`,
      ],
    ],
  ),
  story(
    "paper-bridges",
    "Paper Bridges",
    "Romance",
    "A mapmaker and a ferry keeper discover a route neither of them planned.",
    1,
    [
      [
        "The missing crossing",
        `Ada's map of Bellwater was nearly finished when she discovered a bridge that did not exist. The old survey showed a thin black line across the northern inlet. In its place she found reeds, gray water, and a ferry tied to a weathered post. The ferry keeper was eating an apple with great concentration.

“Where did the bridge go?” Ada asked.

“It fell down forty years ago,” said the keeper. “People take a while to update things.”

His name was Rowan. He carried her across the inlet without charge because, he said, discovering an error was useful work. Ada made notes about the landing, the depth, and the ferry's operating hours. Rowan pointed out that her map also omitted the best place to see herons.

She explained that maps required precision. He explained that herons usually arrived precisely before sunset. They agreed to investigate.

For a week, Ada came to measure the shore. Rowan showed her a path behind the mill and a ruined orchard where the apples still grew. He brought a thermos. She brought sharpened pencils. Each afternoon she found herself drawing the river a little more carefully, as if it belonged to someone she knew.

On Friday, a town official visited the ferry. A new bridge had been approved downstream. The ferry would close in autumn. Rowan smiled and said it would save people time. After the official left, he untied and retied the same rope three times.

Ada did not offer an easy comfort. Her father had run a shop that disappeared when a bigger road arrived. She knew a useful change could still leave a person standing beside a locked door.`,
      ],
      [
        "A different route",
        `“What would you do,” she asked, “if you didn't have to bring everyone to the other side?”

Rowan looked toward the orchard. “Take them somewhere worth going.”

They spent the next fortnight making a second map. It included the heron shallows, the orchard, a sheltered picnic bank, and the places where the river changed color with the season. Ada drew little birds in the margins. Rowan supplied local names that appeared in no official survey.

At first they called it a project. Then Rowan began packing two lunches. Ada began staying after her measurements were complete. Once, in a sudden shower, they sheltered under the ferry's awning and admitted that neither could tell an alder from an ash. It seemed important to confess one weakness when everything else was going so well.

When Ada's commission ended, her train ticket sat on the kitchen table for six days. Rowan never asked about it. This annoyed her until she realized she had never told him she might stay.

She brought him the finished official map. The false bridge was gone. A dotted ferry route crossed the inlet, marked seasonal excursions. In the margin, a tiny orchard flower opened beside a note: Ask locally. Some journeys cannot be scheduled.

“I rented the room above the printer's for another year,” Ada said. “They need someone to draw the county walks.”

Rowan folded his hands to keep them from doing anything foolish with the ropes. “Then I should probably tell you I haven't been bringing extra sandwiches only because you're a good mapmaker.”

“I hoped not. My lettering still leans.”

The bridge opened in September. Rowan's ferry made its first excursion the following Saturday, with six passengers, one delighted child, and Ada sitting at the bow. In the orchard they shared apples under trees nobody could identify. Later, walking back, Rowan took her hand. She knew exactly where they were. For the first time in years, she felt no need to mark it down.`,
      ],
    ],
  ),
  story(
    "pigeon-committee",
    "The Pigeon Committee",
    "Comedy",
    "An unusually efficient town meeting is interrupted by an unusually determined bird.",
    2,
    [
      [
        "An unexpected delegate",
        `At nine on Monday morning, a pigeon walked into the municipal meeting room and sat in the chair reserved for the deputy mayor. This would have been less remarkable if the deputy mayor had not arrived at nine-oh-one and apologized to the pigeon.

“My mistake,” he said, before noticing the feathers.

The chairperson, Mrs. Bell, called the meeting to order. There were seven people, one pigeon, and a stack of papers concerning the restoration of the fountain. The pigeon looked unusually prepared.

“First item,” Mrs. Bell began, “approval of the previous minutes.”

The pigeon pecked the document. Mr. Finch from accounts said he had expressed similar reservations last month. Nobody laughed because his reservations had required fourteen emails and a diagram.

They opened the window. The pigeon remained. They offered breadcrumbs outside. The pigeon ate the breadcrumbs and returned. The caretaker explained that the bird had nested in the fountain during the winter. Apparently, it now considered itself a stakeholder.

“We cannot allow a pigeon to determine public policy,” said the deputy mayor.

“Of course not,” Mrs. Bell said. “It hasn't filled in the form.”

The young clerk, Nina, wrote VISITOR on a folded piece of card and put it in front of the bird. The pigeon immediately stood taller. For the first time that morning, the meeting progressed.

The contractor wanted to replace the old fountain with a modern steel sculpture. Mr. Finch wanted to postpone the work until the next budget. The deputy mayor wanted something that photographed well. The pigeon wanted the biscuit beside the deputy mayor's tea. Their positions were equally firm.`,
      ],
      [
        "The motion carries",
        `At ten-thirty, Nina asked what the residents wanted. This produced the uncomfortable silence that follows a reasonable question nobody has prepared to answer.

They had received a petition with eighty signatures. Unfortunately, it had been filed under Swimming Pools because somebody thought a fountain was a very small one. Nina retrieved it. People wanted the old stone cleaned, the water running, and a bench where their children could sit.

“That sounds almost suspiciously manageable,” said Mrs. Bell.

The pigeon hopped onto the proposed sculpture drawing. With one swift movement it deposited an unmistakable opinion on the polished steel design. The deputy mayor quietly turned the drawing over.

Mr. Finch calculated that cleaning the fountain would cost less than the consultation for replacing it. The contractor confessed that his father had carved the original fish around its rim. He would prefer to restore them, if someone would stop asking him to describe his work as a water experience.

They voted. Seven hands went up. One wing did not, but Nina recorded the visitor as abstaining due to lack of thumbs.

Then came the question of the bench. The deputy mayor suggested a plaque acknowledging the committee's vision. Mrs. Bell suggested a plain bench. The pigeon pecked the plaque quotation with enough force to puncture the price.

“The visitor makes a compelling financial argument,” Mr. Finch said.

By eleven, every decision had been made. This was forty minutes earlier than any meeting in living memory. They opened the door, and the pigeon walked out, pausing at the biscuit tray to claim what could fairly be described as an attendance fee.

The fountain reopened in June. Water ran from the mouths of three beautifully restored stone fish. A plain bench faced the square. The deputy mayor posed beside it, trying unsuccessfully to keep a pigeon out of the photograph.

Nina kept the VISITOR card in her desk. At the next meeting she placed it on an empty chair. Everyone read the petition before speaking. Nobody proposed a plaque. And when the window rattled, seven people sat up straighter, prepared to defend their position to the most effective committee member the town had ever had.`,
      ],
    ],
  ),
  story(
    "borrowed-mayor",
    "The Borrowed Mayor",
    "Comedy",
    "A quiet tailor is mistaken for a visiting dignitary. Lunch gets complicated.",
    3,
    [
      [
        "A very important coat",
        `Tomas had borrowed his cousin's good coat to attend a plumbing appointment. The plumber had said to meet him at the hotel because he was repairing a sink there, and Tomas had assumed hotel plumbing required more formal clothing than ordinary plumbing.

At the entrance, a woman with a clipboard inspected him and said, “At last.” Before he could explain the leaking tap in his kitchen, she pinned a ribbon to his lapel and guided him into a room containing flowers, reporters, and a surprisingly large cheese.

Tomas was a tailor. He knew almost nothing about municipal government, but he recognized a ceremony when trapped inside one.

“Welcome, Mayor,” said the host.

“There may be a mistake.”

“Such modesty,” the host told the nearest reporter.

The visiting mayor was due to sign a friendship agreement between two towns. Tomas was due to discuss a washer. Every attempt to explain this was interpreted as a charming reference to public infrastructure.

“My tap drips all night,” he said.

“A powerful reminder of the importance of maintenance,” said the woman with the clipboard.

Then they asked him to say a few words. Tomas stood behind the lectern and noticed that its velvet covering had been hemmed badly. This calmed him. Whatever else happened, he understood the hem.

“I believe,” he began, “that most things work better when you listen to the person who has to mend them.”

The room applauded. A reporter wrote down the sentence. The hotel manager looked uneasily toward the kitchen.`,
      ],
      [
        "The right person",
        `Tomas continued. He said that nobody should promise a delivery date before checking the work involved. He said pockets were useful and should be real. He said that if you made a mistake, it was better to unpick it immediately than hide it under a button.

By the end, the applause was warm enough to make him nervous. He stepped down and asked again for the plumber. This time a waiter heard him.

“He's in the service corridor,” the waiter whispered. “And the real mayor is in the kitchen.”

The mayor, it transpired, had entered through the wrong door. A cook had handed her a basket of rolls, and she had been too polite to refuse. When Tomas found her, she was buttering the final six.

He explained everything. She listened, looked at his ribbon, and laughed until a roll fell off the tray.

“I was wondering why nobody needed me,” she said. “I assumed it was an unusually successful visit.”

They returned to the ceremony together. Tomas told the room he was a tailor named Tomas and had come about a dripping tap. The clipboard woman went pink. The host apologized to the mayor, the tailor, and the cheese, which had acquired a ribbon of its own during the confusion.

The mayor signed the agreement with her actual name. Then she asked Tomas to stay for lunch. She said the speech had been better than hers, which contained three paragraphs about opportunities and no information about pockets.

At the table, Tomas finally met the plumber. They discussed the tap while the mayor discussed a damaged public water pipe with him. For once, nobody needed a formal report to discover the problem. They simply asked the person who knew where the water went.

The next morning, the local paper printed a photograph of the mayor beside Tomas. Underneath it read: Visiting delegation calls for practical improvements. There was a small correction on page two explaining that half the delegation was a tailor.

His cousin demanded the coat back immediately. It had become, he claimed, politically significant. Tomas returned it with the ribbon still attached and a neatly repaired pocket.

His tap stopped dripping on Thursday. The public pipe was repaired on Friday. The hotel ordered new curtains from him, with real hems and no diplomatic obligations. Tomas considered this an excellent week for government.`,
      ],
    ],
  ),
  story(
    "signal-nine",
    "Signal at Nine",
    "Thriller",
    "A retiring radio operator hears a call from a station that closed years ago.",
    4,
    [
      [
        "A voice in the static",
        `June had one hour left on her final shift when the old receiver spoke. The coast station's modern equipment showed clear weather, empty lanes, and a fishing boat returning south. The old receiver, kept for emergencies, gave three short bursts of static. Then a voice said, “North light. Nine. The stairs are gone.”

North Light had been closed for twelve years. June knew because she had locked its radio cabinet herself. She called back. No answer. She checked the frequency twice and called the harbor master.

“Probably someone testing a set,” he said. “There are no vessels there.”

June looked at the tide chart. High water at nine. North Light stood on a rock shelf reached by steps from the mainland. A winter storm had taken those steps away. At high tide the shelf became an island, and in a strong swell, barely an island at all.

She asked for a patrol boat. The harbor master asked for something more definite than a voice. June remembered being twenty-three and making exactly that mistake: waiting for certainty while a missing dinghy drifted past the last safe channel.

She turned the old receiver's volume up. Beneath the static she heard a rhythmic click. Not interference. Somebody was pressing the transmit key without speaking. Three clicks, a pause, three clicks.

At eight-twenty, she telephoned the caretaker of the coastal walking trail. His daughter and her friend had gone out to photograph the lighthouse. They had taken the path that older maps still marked as open. He had expected them home an hour ago.`,
      ],
      [
        "Before the water",
        `The patrol boat launched at eight-thirty. June kept calling. She spoke slowly, describing the safest corner of the tower platform, away from the sea-facing wall. The receiver answered with two clicks. Someone was listening.

Rain swept over the harbor. On the camera feed, lights on the patrol boat became tiny moving stars. June pulled out the paper chart she had used before the screens arrived. There was an underwater ridge west of North Light. With the tide rising and wind turning, the obvious approach could push the boat onto it.

She radioed the patrol captain and gave him a narrower route from the south. He asked whether she was sure. June measured the bearings with a ruler whose edge had been worn smooth by thirty years of hands.

“I'm sure of the ridge,” she said. “Go slowly.”

At eight-fifty, the stranded voice returned. “Water in the room. Door won't open.”

June remembered the cabinet, the old desk, and the window above it. She told them how to drag the desk under the window and release its upper catch. The girl said her friend was frightened. June said being frightened was allowed, but they needed to move the desk together.

For two minutes there was nothing. June could hear the wall clock in the harbor master's office through his open microphone. Then three clicks came through, followed by a breathless, “We're up.”

The patrol captain reached the lee side at eight-fifty-eight. His crew threw a line to the window. The first girl came down, then the second. At nine-oh-three, a wave broke against the platform and carried away the door.

June stayed beside the receiver until the boat entered the harbor. She watched the girls step onto the pier wrapped in orange blankets. The caretaker held them both, too relieved to decide whom to scold first.

Her replacement arrived with a cake that said Happy Retirement. June asked him to wait while she wrote one final note in the log: Old receiver functioning. Test monthly. Never assume an empty screen means an empty sea.

In the morning, she walked home past the harbor. The tide was low and the sky bright. Behind her, at the station, someone switched on the old receiver. For the first time in twelve years, its small green light had a place in the daily routine.`,
      ],
    ],
  ),
  story(
    "night-platform",
    "The Night Platform",
    "Thriller",
    "One delayed train. One unattended parcel. Twelve minutes to make the right call.",
    5,
    [
      [
        "The parcel",
        `The parcel appeared on platform four at eleven-seventeen. It was wrapped in brown paper and tied with green string. Nora, the station's night supervisor, noticed it because every other passenger had followed the announcement to platform two. A storm had delayed the last northern train, and everyone was tired enough to obey any confident voice.

She did not touch the parcel. She closed the platform gate and called station security. The label showed a laboratory address and the words KEEP COOL. A wet handprint crossed the paper.

At the far end of the platform, a maintenance door banged. Nora shone her torch down the tracks and saw a man holding the rail to steady himself. He was wearing a courier's jacket. Before she could call to him, he disappeared through the door.

Security arrived. Together they checked the corridor camera. The courier had stumbled into an unused storage room. Nobody had come out. The room lay beside an old service lift that had been disconnected during renovation.

Nora took the security officer through the staff passage. They found the outer door stuck against a fallen metal shelf. From behind it came a soft tapping. The courier had been trying to move the shelf when his blood sugar dropped. His medical identification bracelet explained the confusion.

They called for medical help. He could answer simple questions, but kept repeating, “The parcel. The train. Midnight.”

The officer offered reassurance. Nora checked the clock. Eleven-thirty-one. The last train was now due in twelve minutes.`,
      ],
      [
        "Twelve minutes",
        `Nora called the number on the parcel's label. A laboratory technician answered immediately. The package contained a temperature-sensitive culture needed to confirm whether a town's water was safe. It had no hazard marking because it was not dangerous cargo, but an evening of warmth could ruin it. A team was waiting at the next station with a proper insulated case.

The courier had rushed in from the rain, seen the changed platform announcement, and become disoriented. He had set the parcel down to look for help. Nothing about this was a mystery now, but the timetable remained unforgiving.

Nora asked the technician how to preserve it safely. Following his instructions, security placed the unopened parcel into a clean insulated container from the first-aid room with sealed cold packs around it. Nora recorded every step. There would be no clever shortcuts involving somebody's lunch refrigerator.

Meanwhile, maintenance arrived with the correct tools to free the trapped door. The courier was on the floor, exhausted but speaking more clearly. The paramedics took over. He caught Nora's sleeve and asked if he had missed the train.

“You aren't going on it,” she said. “Your parcel might.”

She contacted the conductor and the station at the other end. They agreed to a documented handover. By eleven-forty, the conductor was waiting beside the gate, but the train still showed no sign of arriving. Lightning had stopped signals two miles south.

Nora returned to the phone. The technician listened to the new delay and gave her a second option: a registered night courier from the hospital, ten minutes away. She booked the transfer through the laboratory's dispatcher. It meant paperwork. It also meant the parcel would reach the people who needed it.

At eleven-fifty-six, a small van stopped outside the station. Nora checked the driver's identification, obtained a receipt, and watched the insulated case disappear into the vehicle. The train arrived at twelve-twenty, almost apologetically empty.

The courier sent a message the next afternoon. He was well. The samples had arrived in usable condition. The town's water had been cleared, and the laboratory had revised its delivery plan so one person and one late train could never again be the only route.

Nora pinned the thank-you note in the staff room. Under it she placed a new sign: If the first plan fails, call before you run. Then she went back to platform four, where the ordinary brown paper bin had never looked so reassuring.`,
      ],
    ],
  ),
  story(
    "silent-clock",
    "The Silent Clock",
    "Mystery",
    "A clock stops every Thursday. Its owner insists it is keeping a promise.",
    6,
    [
      [
        "Thursdays at four",
        `The clock in the Bellweather Museum stopped every Thursday at four. It restarted at five, without anybody touching it. The curator, Mrs. Vale, described this as a mechanical irregularity. The retired caretaker described it as a promise. Elin, the new collections assistant, wrote both explanations in her notebook and underlined neither.

The clock stood in the old reading room, which had once been part of a boarding house. Its wooden case held a brass pendulum and a little painted moon. Elin checked the winding schedule. She inspected the gears with a clockmaker. Nothing explained a precise weekly pause.

On Thursday she placed a chair beside the clock at three-fifty. At four, a faint scrape came from inside the wall. The pendulum stopped. Across the room, Mrs. Vale lowered her voice while showing visitors a display of letters.

At four-thirty, an elderly woman entered carrying a yellow scarf. She sat by the window for twenty minutes, then left. At five the clock restarted with another small scrape.

Elin asked the caretaker about the woman. He said her name was Ruth, and she had visited for years. Then he returned to polishing a doorknob, which seemed an excessive amount of attention for a doorknob that was already shining.

In the museum archive, Elin found a photograph of the reading room from 1954. The clock was there. So was a bench beneath the window and a young woman wearing a pale scarf. On the back someone had written: Thursdays, when the room belongs to us.

There were no names. Elin searched the boarding house register and found that the room had once been used for weekly music lessons.`,
      ],
      [
        "An hour kept",
        `She considered the simplest explanation first. A person was stopping the clock. The scrape was a mechanism operated from the other side of the wall. Behind it lay a staff cupboard, and at four and five the caretaker usually fetched cleaning supplies.

Elin inspected the cupboard with his permission. An old access panel opened onto the back of the clock case. A felt-covered lever could gently hold the pendulum still. It was not an ingenious machine. It was an ingenious kindness.

“I hoped you'd ask Ruth before making a report,” the caretaker said.

The following Thursday, Elin sat beside Ruth at the window. She showed her the photograph. Ruth touched the edge and smiled. She had taught violin in this room. Her husband had taught piano. They met during the quiet hour after lessons, when the boarders were out and the clock was too loud for the little pieces they played.

“He stopped it once,” she said. “We were learning a duet and could never agree whether we were following each other or the ticking. After that, Thursday afternoons were ours.”

When the boarding house became a museum, her husband volunteered to maintain the clock. After he died, Ruth kept visiting. The caretaker had asked whether he could continue the quiet hour. Mrs. Vale had agreed, provided the clock was never damaged and visitors were told its displayed time could be wrong.

“Why call it a mechanical irregularity?” Elin asked the curator later.

Mrs. Vale looked embarrassed. “Because I didn't know whether Ruth wanted her story on a wall.”

Elin understood. A museum preserved objects, but people could still own the memories around them. She asked Ruth what she wanted. Ruth chose a small notice, with no photograph and no names: This clock rests on Thursdays from four to five, in honor of the music once played in this room.

The notice went beside the case. The clockmaker approved the felt lever. The official record gained an accurate explanation, and the caretaker no longer had to pretend he needed polish twice in one hour.

The next Thursday, Elin brought a violin borrowed from the community orchestra. Ruth corrected her grip, very gently. Elin played a short tune badly, then a little better. Outside, the town went on with its appointments. Inside, the clock held its silence, and an old promise found someone new to listen.`,
      ],
    ],
  ),
  story(
    "blue-envelope",
    "The Blue Envelope",
    "Mystery",
    "A letter arrives thirty years late, leading a bookseller to a secret hidden in plain sight.",
    7,
    [
      [
        "No stamp",
        `The blue envelope slid under the bookshop door on a Tuesday. It carried no stamp, only the name of the previous owner, who had retired thirty years earlier. Inside was a drawing of three shelves and a sentence: I left it where the sea meets the stars.

Leah, who now ran the shop, telephoned Mr. Orr. He lived above a bakery in the next town and remembered everything except where he put his glasses. He did not recognize the envelope, but the sentence made him quiet.

“My sister used to say that,” he said. “We played a finding game in the shop when we were children.”

His sister, May, had moved abroad. They wrote at birthdays but had not met in years. A misunderstanding over their parents' house had grown into the kind of silence that eventually seems older than the people inside it.

Leah asked whether May had sent the note. Mr. Orr thought not. Her handwriting slanted sharply; this was printed. He offered to come the following morning.

Meanwhile, Leah examined the drawing. The shelves were marked with a wave, a star, and a little square. The shop's travel books stood next to astronomy, but she found nothing between them except a misplaced cookbook. She searched the old inventory and discovered that the sections had moved twice since Mr. Orr retired.

A photograph from the opening day showed a different arrangement. Sea stories had occupied the low case beneath the skylight. A row of star charts stood on top. That shelf was now in the storeroom, holding boxes of receipts.`,
      ],
      [
        "The old game",
        `When Mr. Orr arrived, Leah had cleared the shelf. He ran a hand beneath its lower edge and found a little brass catch. A narrow wooden panel came loose, revealing a compartment no deeper than a book.

Inside lay a clothbound notebook and a dried paper flower. The notebook contained sketches of imaginary houses: a cottage with a rooftop garden, an apartment inside a windmill, a house where every room faced the sea. The final page showed their parents' home, with two small figures standing outside. One wore a large hat. The other had glasses.

Mr. Orr sat down. He and May had made the notebook together. She drew the rooms; he wrote the impossible building instructions. After their parents died, she had wanted to keep the house. He had wanted to sell because neither could afford its repairs. They had mistaken two different kinds of grief for selfishness.

The notebook had vanished before their argument. He had assumed she took it. Apparently she had assumed the same of him.

But who sent the envelope? Leah looked again at the drawing. The little square matched a sticker on the storeroom boxes. Only one other person had helped sort them: Mr. Orr's niece, Tessa, who volunteered on Saturdays.

Tessa admitted it when Leah called. She had found the hidden catch while cleaning but had not opened it. In a family photograph, she had seen her mother and uncle playing beside the shelf. On its back was the sentence about the sea and stars. She copied the clues because she wanted them to discover the compartment together. She had not expected the old sections to have moved.

“You could have told us,” Mr. Orr said.

“Would you have come?” Tessa asked.

He considered this. Then he asked Leah whether the shop had a quiet corner and a telephone charger. He called May. He did not begin with the house. He began with the windmill, and with the impossible stairs they had drawn when they were twelve.

They spoke for an hour. Nothing settled itself magically. There were apologies, explanations, and a plan to meet halfway in the spring. Before leaving, Mr. Orr bought a blank notebook and asked Leah to post it to his sister.

The blue envelope stayed in the bookshop's drawer. The hidden compartment held a new note: If you find this, tell someone you miss them. Leah did not move the shelf again. Some pieces of furniture, she decided, had finally arrived in the right place.`,
      ],
    ],
  ),
];

export function filterBooks(query: string, genre: Genre | "All"): Book[] {
  const needle = query.trim().toLocaleLowerCase();
  return books.filter(
    (book) =>
      (genre === "All" || book.genre === genre) &&
      book.title.toLocaleLowerCase().includes(needle),
  );
}

// Anchors are word indices in an immutable book, independent of display pages.
export type Word = {
  text: string;
  index: number;
  section: number;
  paragraph: number;
  first: boolean;
  last: boolean;
};
export function bookWords(book: Book): Word[] {
  let index = 0;
  return book.sections.flatMap((s, section) =>
    s.paragraphs.flatMap((p, paragraph) => {
      const words = p.split(/\s+/);
      return words.map((text, i) => ({
        text,
        index: index++,
        section,
        paragraph,
        first: i === 0,
        last: i === words.length - 1,
      }));
    }),
  );
}
