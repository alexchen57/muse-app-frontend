Code Architecture

MUSE — Multisensory Emotional Regulation System

MUSE is designed as a modular, real-time affective computing system that translates physiological signals into adaptive, multimodal emotional regulation strategies.
Rather than focusing on isolated algorithms, the system architecture reflects a closed-loop cognitive model, where sensing, inference, and intervention continuously inform each other.

1. Affective Signal Acquisition & Preprocessing

This module is responsible for transforming raw physiological inputs into temporally stable affective descriptors.

Physiological signals such as heart rate are inherently noisy and sensitive to movement and transient emotional fluctuations. To prevent overreactive system behavior, I implemented a sliding-window based preprocessing pipeline that emphasizes sustained trends over instantaneous changes. Standard heart rate variability (HRV) metrics are extracted and normalized to form a robust input space for affective inference.

Key design consideration:

Emotional regulation should respond to patterns, not spikes.

2. Emotional State Modeling Engine

Instead of directly classifying emotions into discrete labels, MUSE models emotional state as a continuous latent process with controlled state transitions.

Physiological indicators are mapped to a small set of regulation-relevant affective states (e.g., calm, stressed, overloaded, recovering) using rule-based thresholds combined with temporal hysteresis. This approach reduces false state oscillation and preserves psychological plausibility in long-term interaction scenarios.

Why this matters:

The goal is not emotional recognition accuracy, but behaviorally meaningful regulation timing.

3. Adaptive Music Regulation Logic

Music in MUSE functions as a regulatory intervention rather than a recommendation target.

Instead of optimizing for user preference or engagement, this module selects audio features—such as tempo, rhythmic density, and arousal level—based on the user’s current physiological state. Target parameters are computed relative to real-time heart rate trends, enabling gradual entrainment rather than abrupt emotional shifts.

Design philosophy:

Regulation prioritizes physiological alignment over personalization.

4. Multimodal Closed-loop Feedback System

At the core of MUSE is a continuous feedback loop that dynamically adjusts intervention strategies based on physiological response.

As music is delivered, the system simultaneously monitors changes in affective signals and updates both emotional state estimates and regulation intensity. This closed-loop structure allows MUSE to adapt in real time, minimizing overstimulation and avoiding emotional overshoot.

Interaction model:

Sense → Infer → Intervene → Re-sense

5. System Orchestration & Real-time Constraints

To support real-time interaction, the system architecture is designed with asynchronous processing and modular decoupling.

Signal acquisition, affective inference, and feedback control operate as independent yet synchronized components. This structure ensures low-latency responses while maintaining scalability for future extensions, such as EEG or fNIRS-based affective inputs.

Engineering focus:

Temporal alignment is treated as a first-class design constraint.

Architectural Summary

MUSE’s code architecture reflects a deliberate balance between psychological validity and system-level robustness.
By prioritizing closed-loop regulation, temporal stability, and modular extensibility, the system demonstrates how affective theory can be operationalized into an interactive, real-time computational system.