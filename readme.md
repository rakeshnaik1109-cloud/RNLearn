# RNLearn

> Deep-dive guides, interactive models, and essays across science, economics, mathematics, and history.

**Live site:** [https://rakeshnaik1109-cloud.github.io/RNLearn/](https://rakeshnaik1109-cloud.github.io/RNLearn/)

---

## Overview

RNLearn is an editorial, static notebook designed for long-form learning. It features deep-dive analytical pieces, derivations, interactive canvas visualizations, and historical investigations—all built with zero tracking, zero ads, and pure static HTML/CSS/JavaScript.

### Featured Series: *How We Came To Know*
A 12-part master series chronicling the history, epistemology, and methodology of science from prehistoric toolmakers to modern physics:
1. **Part 1**: *Before Science: How a Curious Ape Learned to Know* (Paleoanthropology & early empiricism)
2. **Part 2**: *Gods, Stars and Calendars: The Dawn of Systematic Order* (Mesopotamia, Egypt & early astronomy)
3. **Part 3**: *Asking "Why" Without the Gods: The Birth of Natural Philosophy* (Ionian physics, Indian atomism & Greek biology)
4. **Part 4**: *From Tally Marks to Proof: The Story of Mathematics to the Middle Ages* (Axiomatic geometry & algebra)
5. **Part 5**: *Keepers and Builders of Knowledge: Science in the Medieval Commonwealth* (Islamic golden age, optics & universities)
6. **Part 6**: *The Clockwork Heavens and the Open Eye: The Scientific Revolution* (Copernicus, Galileo, Kepler & Newton)
7. **Part 7**: *From Alchemy to the Periodic Table: The Making of Chemistry* (Boyle, Lavoisier & Mendeleev)
8. **Part 8**: *The Book of Life: Evolution, the Cell, and the Code* (Darwin, Mendel, germ theory & DNA)
9. **Part 9**: *Fire, Light and Fields: Energy, Heat and Electromagnetism in the Nineteenth Century* (Thermodynamics & Maxwell)
10. **Part 10**: *The Strange New Physics: Relativity, the Quantum, and the Subatomic Realm* (Relativity & quantum mechanics)
11. **Part 11**: *Mathematics Becomes Infinite: Calculus, Rigour, and the Limits of Reason* (Analysis, set theory & Gödel)
12. **Part 12**: *What is Science, Really? Demarcation, Revolutions, and the Fabric of Truth* (Popper, Kuhn & epistemology)

### New Series: *How Machines Learned to Think*
An 8-part history of artificial intelligence, from the first dreams of thinking machines to today's AI and where it may lead:
1. **Part 1**: *Dreams of Thinking Machines: From Bronze Giants to Babbage's Engines* (Myths, automata, Llull, Leibniz, Babbage, Lovelace & Boole)
2. **Part 2**: *Can Machines Think? Turing, the First Computers and the Birth of AI* (Turing, model neurons, cybernetics, the Turing test, Dartmouth & the perceptron)
3. **Part 3**: *Big Promises and AI Winters: ELIZA, Expert Systems and Two Crashes* (SHRDLU, ELIZA, Perceptrons, Lighthill, MYCIN & the AI winters)
4. **Part 4**: *Learning from Examples: Backpropagation, Big Data and Deep Blue* (Backpropagation, LeCun, statistical NLP, spam filters, TD-Gammon, Deep Blue & overfitting)
5. **Part 5**: *The Deep Learning Revolution: ImageNet, AlphaGo and AlphaFold* (AlexNet, GPUs, word2vec, attention, GANs, AlphaGo, AlphaFold & bias)
6. **Part 6**: *Attention Is All You Need: Transformers, GPT and the Road to ChatGPT* (Transformers, next-word prediction, scaling laws, RLHF, ChatGPT & hallucination)
7. **Part 7**: *Where We Are Now: Reasoning Models, Agents and the AI Boom* (2023 to November 2026: multimodal and open models, reasoning, DeepSeek, agents, costs & limits)
8. **Part 8**: *Where Is It Leading Us? Work, Safety, Rules and the Future of AI* (Five views of the future, jobs, education, alignment, risks, regulation & lessons)

---

## Architecture & Tooling

- **Dual-Theme Typography**: Warm editorial paper light mode & night slate dark mode with WCAG AA contrast compliance.
- **Fast Client-Side Search**: Zero-dependency lunr/prefix client search index.
- **KaTeX Mathematics**: Full support for inline `$ ... $`, display `$$ ... $$`, with reactive MutationObserver for interactive widgets.
- **Responsive Layout**: Wide-screen layout with left-attached sticky Table of Contents and expandable figures.
- **Deterministic Static Site Generator**: Built with Python standard library (`tools/build.py`).

### Local Development & Verification

```bash
# Build derived pages (search index, subject, tag and series pages)
python tools/build.py

# Verify build idempotency (used in CI)
python tools/build.py --check

# Run site integrity and standards verification
python tools/check.py
```

---

## License

© 2026 Rakesh Naik. All rights reserved. No part of this repository or website may be reproduced or reused without written permission. See [LICENSE](LICENSE).
