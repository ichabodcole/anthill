---
name: guidance-not-argument
description: Write or rewrite a document that a reader is meant to follow (an SOP, a principles file, a seat or role doc, a contracts file, a wiki method page, a skill, a README) in plain technical prose. Use when writing such a document, or as an editorial pass over one that reads like an essay, a diary, or a persuasion piece. Do not use on research documents (investigations, reports, proposals, curation proposals, retros) whose purpose is to present evidence and reach a conclusion.
---

# Guidance, not argument

## The one rule

The document tells the reader what is true and what to do. It does not argue for it.

A reader of this document will follow it. They are not deciding whether to follow it.
Every sentence that exists to convince, justify, or record how the rule was learned is removed.
Every sentence the reader needs in order to act correctly is kept, exactly.

Target register: a manual, a reference page, a checklist. Not a novel, a diary, an essay, or a post-mortem.

## Classify every sentence

Each sentence is one of five kinds. The first four are kept. The fifth is cut.

1. **Instruction.** What to do or not do. Includes the conditions under which it applies.
2. **Fact.** What a thing is, what it contains, what a value means, who owns it, what order things happen in.
3. **Definition.** What a term means, or what counts as compliance with an instruction. Example: "A check that goes quiet is indistinguishable from one that never finished" defines what "closed" means for the instruction "say when a check closes". Keep it.
4. **Mechanism.** What makes an instruction work, or what makes its condition true. The reader applies the instruction differently, or at a different scope, without it. Example: "The dirty-path read happens after the lock wait, so a peer who landed while you queued does not appear in `uncheckedAgainst`." Without this the reader treats an empty list as an all-clear. Keep it.
5. **Argument.** Evidence that the rule is correct, or the history of how it was found. The reader applies the instruction the same way whether or not they know it. Cut it.

Test for mechanism versus argument: if the sentence were false, would the reader do something different, or apply the instruction at a different scope? Yes: mechanism. No: argument.

Two special cases of "fact" that are easy to misclassify as argument. Keep both.

- **A distinction between two things that could be confused.** "`null` is not zero." "A departure record is administrative, not terminal." State it as a distinction. If the source says why the distinction must not be collapsed, cut the why.
- **Identity in a role document.** What the role does and what it owns. Keep it, written as a job description: imperatives for what the role does ("Verify the team's work"), declaratives for what it owns ("This seat owns no code slice"). Not first person, and not a title for the role. A persona invites epithets and self-description. A job description has neither.

## What to remove, by class

Each class below is a kind of sentence, not a list of words. The example shows one form. The class has many forms. Learn what the class does to the reader and read for that.

- **Origin stories.** The incident, measurement, or session in which a rule was learned. Example: "n=3 in one session, two agents, one of them the seat who built the flag." Why it fails: the reader applies the rule the same way whether or not the incident happened. The sentence spends the reader's attention on the past instead of on what to do.
- **Justification.** A clause that argues the rule is right. Example: "because a principle without its experience is a slogan." Why it fails: the reader is not deciding whether to follow the rule. Persuasion aimed at someone who will comply anyway is wasted, and it lengthens the path to the instruction.
- **Meta-commentary about the document.** A sentence about the document itself: why it exists, why it is separate from another, why a passage is here. Example: "This paragraph is the fix." Why it fails: it tells the reader about the author's editing decisions, which change nothing the reader does.
- **Emphasis devices.** Typography or wording whose only job is to raise the volume of a sentence: bold or capitals mid-sentence, warning glyphs, intensifiers. Example: "**⚠ THE RULE HOLDS.**" Why it fails: emphasis signals importance without adding content, and when every rule is emphasised none is. A rule's importance is carried by its placement and its wording.
- **Rhetorical questions and self-talk.** A question the document asks so it can answer it, or a quoted inner voice. Example: "Ask yourself: what is behind this besides us agreeing?" Why it fails: the instruction is hidden inside the performance. State it: "Ask what evidence supports the claim."
- **Figurative language.** A metaphor, idiom, or coined phrase used for colour where a plain word exists. Example: "assemble, don't marinate." Why it fails: the reader has to translate the figure before acting on it, and two readers translate differently. See "House terms" for the exception.
- **Epithets.** A role or thing named by a descriptive title instead of by what it does. Example: "The hands that turn a decision into a command." Why it fails: the reader learns a nickname and still has to infer the job. Write the verb: "I turn a decision into a working, tested CLI command."
- **Foreshadowing.** A short sentence that summarises the sentences after it and cannot be understood without them. Example: "I emit. I do not consume." followed by the sentences that say what that means. Why it fails: it is read twice, once as a puzzle and once as a summary, and only the later sentences carry content.
- **Abstract nouns standing in for a concrete thing.** A general noun where a specific one exists. Example: "the seams whose truth lives in my code" for "the code that implements Contracts 1, 3, 4, 5(a), and 7". Why it fails: the reader cannot act on "truth". They can act on a contract number.
- **Idioms standing in for a condition.** An informal phrase where the rule needs a precise condition. Example: "if it reads wrong" for "if anything here is incorrect or needs to change". Why it fails: the reader cannot tell what counts, so the condition never fires, or fires on the wrong thing.
- **Defensive negatives.** A statement of what the document does not contain, or what the reader must not do, when nothing indicates they would. Example: "It does not carry lessons or a session log." Why it fails: it warns against a behaviour the reader was not going to perform, and each such warning dilutes the ones that matter. Keep a negative instruction when the behaviour has been observed, or when it is a real boundary of a role ("I do not land product code").
- **Appeals to the reader's feelings.** A description of how something feels rather than what it is. Example: "agreeing is the humble-looking move." Why it fails: it explains the reader's psychology to them instead of stating the rule.
- **Hedged restatement.** A rule stated by contrast with a wrong version of itself. Example: "Not 'be careful with controls', which fails where it is needed, but name the world where the control fails." Why it fails: the reader has to hold the wrong version to find the right one. State the right one.
- **Second phrasings.** The same point made twice in different words. Why it fails: the reader looks for the difference between the two and there is none. Keep the more concrete phrasing.
- **Dated amendment notes inside a rule.** A record of when and how the rule's wording changed. Example: "widened session 11". Why it fails: version history is the repository's job. The reader needs the rule as it is now.
- **Reconciliation tables, sweep logs, and audit records.** Evidence that the document was checked. Why it fails: it is a record about the document, not guidance in it. Remove it. Do not copy it anywhere. See "State logs" for the exception.
- **Cross-references to argument.** A pointer to reasoning elsewhere. Example: "same reason a ruling must name what it did not rule on." Why it fails: it sends the reader away from the instruction to read something that will not change what they do. A link goes with the argument it points at.

## What to keep, exactly

Do not lose any of these. A rewrite that drops an instruction has failed even if it reads well.

- Every instruction, including negative ones.
- Every condition under which an instruction applies, including exceptions and edge cases.
- Every mechanism and every definition.
- Every exact name: command, flag, path, file, field, value, seat, role, person, tool, test name, scenario name.
- Every order of operations.
- Every distinction between two things that could be confused.
- Example commands and example values.
- Structural elements the tooling reads: front matter, tables, code blocks, a header block a command parses, a section name a skill or a lint expects.
- Existing links the reader follows to act.

When a passage contains both an instruction and its argument, separate them. Keep the instruction. Cut the argument. Do not cut the whole passage.

## Extraction

Some passages state a consequence and leave the instruction implied. "A thorough report contains the release and therefore buries it."

You may extract the implied instruction and state it: "Do not put the release inside a report. Send it as its own message."

Rules for extraction:

- Extract only when the instruction is clearly implied. Do not infer one from a general observation.
- State it at the narrowest scope the source supports. Do not generalise.
- Do not add facts, examples, or conditions the source does not contain.
- List every extraction in your report, with the source sentence and the extracted instruction.

## Do not invent

Do not add a gloss, an expansion, a definition, an example, or a fact that is not in the source or in a document the source points at.
If a term is unexplained and you do not know what it means, leave it as it is. Do not guess an expansion.

## House terms

A project's own vocabulary is a set of names, not figurative language. "Seat", "lane", "wire", "land", "gate", "seam", "card" are names. Keep them. Do not replace them with a literal paraphrase.

A word is a house term if the document uses it consistently as the name of one thing. A word is figurative if it is used once, for colour, where a plain word would do.

Expand a house term on first use only when the source, or a document it points at, supplies the expansion. Otherwise leave it.

A word can be both a house term and an origin-story marker. "Scar" names the evidence attached to a principle in some projects, and also introduces an incident narrative. Keep the word where it names the thing. Cut the sentence where it introduces the narrative.

## Sentence rules

- One claim or one instruction per sentence.
- Every sentence has a subject and a verb.
- A sentence stands on its own. If a sentence can only be understood by reading the one after it, rewrite or cut it.
- Instructions to the reader are imperative: "Run the gate." "Do not pipe it."
- Facts and definitions are declarative. A role document is written as a job description, not in the first person: "Do not design" and "This seat owns the verdict", not "I do not design". Refer to the role by its name when a subject is needed.
- Literal vocabulary. The plain word for the thing. The same word every time.
- No em-dashes, anywhere in body prose. Not between clauses, not around an appositive, not before a list. Use a full stop, a comma, a colon, or parentheses. An em-dash in a heading that other documents link to, or in a header block tooling reads, stays.
- No semicolons joining clauses. A set of parallel short clauses becomes a list, or one sentence with commas and "and".
- A list inside a sentence: introduce it with a colon, or put the examples in parentheses. Prefer the colon when the list is the point of the sentence. Prefer parentheses when the list is examples.
- No parentheticals that carry an instruction. A parenthetical may hold examples, an expansion of a name, or a code identifier.
- No italics for emphasis. No bold inside a sentence. Bold is for: the lead phrase of a list item, the lead phrase of a paragraph that functions as a list item, a term being defined, a heading.
- A bold lead phrase ends with a full stop or a colon. Never an em-dash. Write `**maestro (lead):** the seat exists for him.` not `**maestro (lead)** — the seat exists for him.`
- A bold lead phrase may be a question when the reader answers it (a prompt in a report template).
- A bold lead phrase may be a contrast ("The skeleton is a hypothesis, not a form to fill in") when the contrast is the rule's content. It may not be a slogan or a summary of the argument.
- Numbers, shas, dates, and counts appear only when the reader uses them: an identifier, a threshold, a version, a limit, a name of a test scenario. A number that exists to prove a point is argument.

## Structure rules

- The document opens with what it is and who reads it, in one to three sentences. No thesis, no motivation.
- A rule is a bold lead phrase followed by the rule. A set of steps is a numbered list. A set of parallel items is a bulleted list. Prose is for a single line of explanation.
- Group by topic, not by the order things were learned.
- Headings are nouns or noun phrases. Not questions, not slogans.
- **A label repeated as document structure** ("Why it bites:" at the end of every contract) is renamed once, consistently, to a noun that says what the content is ("Mechanism:"). List the rename in your report.
- **Heading text is preserved** when another document may link to it, or when the task says so. Otherwise rewrite it as a noun phrase and list the changed heading in your report. The report line matters: a changed heading breaks anchors.
- **Blockquotes** are presentation, not structure. Unwrap a blockquote into a paragraph unless it is a header block that tooling parses, or the task says to keep it. The content inside is classified sentence by sentence like anything else.
- **Boilerplate that restates policy documented elsewhere** becomes one sentence per policy and a pointer to where the policy lives. A preamble block of any length reduces to at most five lines. Example: a preamble that explains why a doc is curated, who edits it, and when, becomes: "This doc is curated. It changes at `anthill:curate`. If it reads wrong, say so in your report." A notice that a command name is shorthand becomes: "`anthill <command>` is shorthand. Take the resolved command from `anthill:join`."
- **Identical passages across sibling documents** are made identical after the rewrite. Use the shortest version that carries every instruction in any of them.
- **A placeholder section** that a later process fills ("Not yet written for this team") is kept, even though it is near-empty.
- **A section that is empty after cuts** is removed, unless it is a placeholder.
- **A bold lead phrase whose body is empty after cuts** stays if the phrase is itself an instruction. Otherwise remove it.
- **A gap in a numbered sequence** (clauses (a) and (c) with no (b)) gets one line saying the gap is deliberate and where the removed item went, if anywhere. Nothing more.
- **Front matter** is preserved byte for byte. Its prose is not edited. Body text that must mirror front matter (a catalog line that repeats a page's description) stays a mirror. Do not create a mismatch. If the front matter prose breaks these rules, say so in your report and leave both alone.
- One sentence per line where the document already uses that convention or the project requires it. Otherwise wrap normally.
- Preserve existing links the reader follows to act. Remove a link whose only target is removed argument. A single-line pointer to a history file may stay if the source had one.

## Rulings

A document may carry a ruling: a decision a human made that the reader applies. State it as the rule, in the imperative. Cut who ruled, when, and why. Example: "Ruled by the human, 2026-08-02: participate when a need arises" becomes "Participate when a need arises." Why: the reader follows the rule the same way whether or not they know its origin. The origin lives in the research document or state log that records the decision.

## State logs

A guidance document may contain a log that the procedure itself reads: which batches have been processed, which runs are done, where each run's artifacts live.

Keep it. Reduce each entry to the facts the procedure needs: identifier, date, what was processed, where the artifacts are, what the outcome was. Cut commentary, rates, and assessment.

## Two audiences

A document may be read by people who apply it and by people who write into it. Instructions to writers ("what belongs here", "who may edit this") are instructions. Keep them. Argument aimed at writers is still argument. Cut it.

## Damaged input

If the source is truncated or a sentence is incomplete, drop the fragment. Do not complete it. Say so in your report.

## Applying a reviewer's correction

When a reviewer marks a sentence, they are naming a kind of sentence, not a phrase. Classify what kind it is. Then read every document in scope, whole, for other sentences of that kind. A search for the marked words finds only the instances that share those words.

## Precedence

"Cut on classification" wins over "keep when unsure".
"Keep when unsure" applies only when you cannot classify the sentence. If you classify it as argument and feel uneasy, cut it and list it in your report.

## Procedure for a rewrite

1. Read the whole document once.
2. Build the content inventory: every instruction, condition, mechanism, definition, distinction, and exact name. Nothing on the inventory may be lost.
3. Rewrite section by section. For each sentence: classify it, then apply the sentence rules.
4. Check the output against the inventory. Restore anything on the inventory that is missing.
5. Check the output against the removal classes. Remove anything remaining.
   Do this by reading the whole document, not by searching for the example phrases. The removal classes name a kind of sentence, and each kind has many surface forms. A search finds the form you already know. Reading finds the ones you do not.
6. Report, in this order:
   - Word count before and after. Line count is not a useful measure; the sentence rules split lines as fast as the cuts remove them.
   - Every extraction: source sentence, extracted instruction.
   - Every changed heading.
   - Every sentence you cut while uneasy, quoted.
   - Every sentence you kept while uneasy, quoted.
   - Every place this guideline was ambiguous or silent, with the sentence that exposed it.

## Writing a new document

The same rules apply when writing from nothing. Write the inventory first: what the reader must do, what is true, what the terms mean, what mechanisms they need. Then write the sentences. Do not write the argument and edit it out afterwards.
