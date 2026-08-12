// TutorEngine — Mock implementation with LLM-ready interface
// Architecture: TutorEngine.generateResponse(message, context) → response
// MockTutorEngine: keyword search + kid-friendly templates + author escalation
// LLMTutorEngine: future drop-in replacement via Netlify function → Claude API

export class MockTutorEngine {
  constructor() {
    this._usedBlocks = new Set(); // avoid repeating same blocks in a conversation
  }

  resetConversation() {
    this._usedBlocks.clear();
  }

  generateResponse(message, context) {
    const { allBlocks, topicIndex, currentBlockId, currentChapterId, userProfile } = context;
    const q = message.toLowerCase().trim();

    // Detect question type
    const qType = this._detectQuestionType(q);

    // Score blocks with context awareness
    const scored = allBlocks.map(b => {
      let score = 0;
      const title = (b.meta.title || '').toLowerCase();
      const body = (b.body || '').toLowerCase();
      const words = q.split(/\s+/).filter(w => w.length >= 3);

      for (const word of words) {
        if (title.includes(word)) score += 5;
        if (body.includes(word)) score += 1;
      }

      // Boost current chapter content 3x
      if (currentChapterId && b._chapter === currentChapterId) score *= 3;
      // Boost current block's related content
      if (currentBlockId && b.meta.parent === currentBlockId) score *= 2;
      // Penalize already-shown blocks
      if (this._usedBlocks.has(b.meta.id)) score *= 0.3;

      return { block: b, score };
    }).filter(s => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 4);

    // Find matching topics
    const matchTopics = Object.keys(topicIndex || {}).filter(t =>
      t.toLowerCase().includes(q) || q.includes(t.toLowerCase().split(' ')[0])
    );

    // Calculate confidence
    const topScore = scored[0]?.score || 0;
    const confidence = Math.min(1, topScore / 15); // normalize: 15+ = high confidence

    // Track used blocks
    scored.forEach(s => this._usedBlocks.add(s.block.meta.id));

    // Build response
    const blocks = scored.map(s => ({
      id: s.block.meta.id,
      title: s.block.meta.title,
      chapter: s.block.meta._chapterNum,
      score: s.score
    }));

    if (confidence < 0.1) {
      return {
        text: this._noMatchResponse(),
        blocks: [],
        followUp: 'Zkus se zeptat na servery, pakety, Wi-Fi nebo na to, jak funguje digitální stopa!',
        confidence: 0,
        canEscalate: true
      };
    }

    const top = scored[0].block;
    const teaser = top.meta.teaser || (top.body || '').substring(0, 180).replace(/[#*_\[\]]/g, '').trim();

    let text = this._openingLine(qType, confidence);
    text += `<b>${top.meta.title}</b> (kapitola ${top.meta._chapterNum}) je přesně o tomhle! `;
    text += `${teaser}... `;
    text += `<br><br><a href="#" onclick="event.preventDefault();app.openBlock('${top.meta.id}')">Přečti si tuhle část &rarr;</a>`;

    if (scored.length > 1) {
      text += '<br><br>Mohlo by tě zajímat i:';
      scored.slice(1, 3).forEach(s => {
        text += `<br>&bull; <a href="#" onclick="event.preventDefault();app.openBlock('${s.block.meta.id}')">${s.block.meta.title}</a> (kap. ${s.block.meta._chapterNum})`;
      });
    }

    if (matchTopics.length > 0) {
      text += '<br><br>Související témata: ';
      text += matchTopics.slice(0, 3).map(t =>
        `<a href="#" onclick="event.preventDefault();app.showTopic('${t}')">${t}</a>`
      ).join(' &middot; ');
    }

    const followUp = this._socraticFollowUp(qType, top);

    return { text, blocks, followUp, confidence, canEscalate: confidence < 0.3 };
  }

  _detectQuestionType(q) {
    if (/^(proč|why|how come|what makes)/.test(q)) return 'why';
    if (/^(jak|how|how do|how does|how can)/.test(q)) return 'how';
    if (/^(co kdyby|co by|představ si|what if|what would|imagine)/.test(q)) return 'whatif';
    if (/^(co je|co jsou|co znamená|vysvětli|what is|what are|what's|define|explain)/.test(q)) return 'what';
    if (/^(můžeš|mohl bys|mohla bys|řekni mi|ukaž mi|can you|could you|tell me|show me)/.test(q)) return 'request';
    return 'general';
  }

  _openingLine(qType, confidence) {
    const lines = {
      why: ["Skvělá otázka! O tomhle se v knize píše. ", "Přesně na tohle se ptají i lidé, kteří internet stavěli! ", "Přemýšlíš jako opravdový inženýr! "],
      how: ["Ukážu ti to — v knize je to hezky vysvětlené. ", "Dobrá otázka! Funguje to takhle: ", "Pojďme si to rozebrat krok za krokem: "],
      whatif: ["Ooo, myšlenkové experimenty mám nejradši! ", "Zajímavé! Nad tímhle přemýšlejí i síťoví inženýři. ", "Pojďme tu myšlenku prozkoumat! "],
      what: ["Dobrá otázka! Podívám se, co o tom v knize je. ", "Tohle to znamená: ", "V knize je to vysvětlené takhle: "],
      request: ["Jasně! Najdu ti tu správnou část. ", "Jdu na to! ", "Rád pomůžu — od toho tu jsem! "],
      general: ["Podívám se do knihy! ", "Zajímavá otázka! ", "Tohle jsem našel: "]
    };
    const options = lines[qType] || lines.general;
    return options[Math.floor(Math.random() * options.length)];
  }

  _socraticFollowUp(qType, topBlock) {
    const followUps = {
      why: [
        'Napadá tě příklad ze života, kde na tomhle záleží?',
        'Co myslíš, že by se stalo, kdybychom to udělali naopak?',
        'Proč to podle tebe inženýři navrhli zrovna takhle?'
      ],
      how: [
        'Dokázal/a bys tenhle postup jednoduše vysvětlit kamarádovi?',
        'Která část je podle tebe pro počítač nejtěžší?',
        'Napadá tě situace, kdy by tenhle postup selhal?'
      ],
      whatif: [
        'Jaké důkazy bys potřeboval/a, abys tu myšlenku ověřil/a?',
        'Jak bys navrhl/a experiment, který by to zjistil?',
        'Jaké by mohly být nevýhody takového řešení?'
      ],
      what: [
        'Napadá tě příklad z běžného dne, kde se s tím potkáš?',
        'V čem je to jiné, než jsi čekal/a?',
        'Co tě na tom nejvíc překvapilo?'
      ],
      general: [
        'Co tě na tomhle tématu zajímá nejvíc?',
        'Chceš vyzkoušet praktické aktivity k tomuhle tématu?',
        'Zkus to, co ses naučil/a, vysvětlit někomu dalšímu — líp si to zapamatuješ!'
      ]
    };
    const options = followUps[qType] || followUps.general;
    return options[Math.floor(Math.random() * options.length)];
  }

  _noMatchResponse() {
    const responses = [
      "Hmm, o tomhle se v knize nepíše! Nejlíp umím vysvětlovat, jak funguje internet. Zkus se zeptat na <b>cestu paketu sítí</b>, <b>Wi-Fi</b> nebo <b>IP adresy</b>!",
      "Tohle kniha nepokrývá! Ale rád pomůžu s tím, <b>jak spolu počítače mluví</b>, <b>co je server</b> nebo <b>jak funguje digitální stopa</b>. Nebo můžeš napsat autorům knihy!",
      "Tohle jsem v knize nenašel. Kniha je hlavně o <b>sítích</b>, <b>webu</b>, <b>bezpečnosti</b> a <b>soukromí na internetu</b> — na cokoliv z toho se mě klidně zeptej!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Generate suggested questions based on current block content
  getSuggestedQuestions(block) {
    if (!block) return [];
    const body = (block.body || '').toLowerCase();
    const title = block.meta?.title || '';
    const questions = [];

    if (body.includes('paket')) questions.push('Co se stane, když se paket po cestě ztratí?');
    if (body.includes('server')) questions.push('Kde vlastně fyzicky stojí servery?');
    if (body.includes('ip adres') || body.includes('adresa')) questions.push('Jak počítač pozná, komu má data poslat?');
    if (body.includes('wi-fi') || body.includes('wifi')) questions.push('Čím se liší Wi-Fi od mobilních dat?');
    if (body.includes('dns') || body.includes('doména')) questions.push('Jak se z názvu stránky stane IP adresa?');
    if (body.includes('soukromí') || body.includes('data')) questions.push('Jaká data o mně weby a aplikace sbírají?');
    if (body.includes('kabel') || body.includes('optick')) questions.push('Jak se internet dostane přes oceán?');
    if (body.includes('router') || body.includes('směrovač')) questions.push('Co dělá router u nás doma?');
    if (body.includes('heslo') || body.includes('bezpečn')) questions.push('Jak si vytvořit opravdu silné heslo?');
    if (body.includes('stopa') || body.includes('sdílen')) questions.push('Dá se z internetu něco úplně smazat?');
    if (body.includes('šifrov')) questions.push('Jak šifrování chrání moje zprávy?');
    if (body.includes('prohlížeč') || body.includes('web')) questions.push('Co se stane, když do prohlížeče napíšu adresu stránky?');

    // Fallback
    if (questions.length === 0) {
      questions.push(`O čem hlavně je „${title}“?`);
      questions.push(`Proč je tohle téma důležité?`);
    }

    return questions.slice(0, 3);
  }
}

// Conversation manager — persists chat history
export class ConversationManager {
  constructor() {
    this.conversations = [];
    this.authorMessages = [];
    this.load();
  }

  load() {
    try {
      const data = JSON.parse(localStorage.getItem('pbook-conversations') || '{}');
      this.conversations = data.conversations || [];
      this.authorMessages = data.authorMessages || [];
    } catch (e) {}
  }

  save() {
    try {
      // Keep last 20 conversations
      const recent = this.conversations.slice(-20);
      localStorage.setItem('pbook-conversations', JSON.stringify({
        conversations: recent,
        authorMessages: this.authorMessages
      }));
    } catch (e) {}
  }

  getOrCreateConversation(blockId, chapterId) {
    // Find recent active conversation for this context
    const recent = this.conversations.find(c =>
      c.status === 'active' &&
      c.context.blockId === blockId &&
      Date.now() - c.startedAt < 30 * 60 * 1000 // within 30 min
    );
    if (recent) return recent;

    const conv = {
      id: 'conv-' + Date.now(),
      startedAt: Date.now(),
      context: { blockId, chapterId },
      messages: [],
      status: 'active'
    };
    this.conversations.push(conv);
    this.save();
    return conv;
  }

  addMessage(convId, role, text, extra = {}) {
    const conv = this.conversations.find(c => c.id === convId);
    if (!conv) return;
    conv.messages.push({ role, text, timestamp: Date.now(), ...extra });
    this.save();
  }

  escalateToAuthor(convId, question, blockId, readerProfile) {
    const msg = {
      id: 'msg-' + Date.now(),
      conversationId: convId,
      blockId,
      question,
      readerProfile: {
        level: readerProfile.level,
        xp: readerProfile.xp,
        readCount: readerProfile.readBlocks?.size || 0
      },
      status: 'pending',
      createdAt: Date.now()
    };
    this.authorMessages.push(msg);

    const conv = this.conversations.find(c => c.id === convId);
    if (conv) conv.status = 'escalated';

    this.save();
    return msg;
  }

  getAuthorMessageCount() {
    return this.authorMessages.filter(m => m.status === 'pending').length;
  }
}
