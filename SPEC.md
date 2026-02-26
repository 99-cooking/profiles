# ProfileXT Clone — Specification

Source: https://docs.google.com/document/d/1G1GO45LZ6NSAmLUcseHa3S8ahMLfAPkJe8VHAxTcNaI/

## Overview
A "Total Person" psychometric assessment platform that measures cognitive abilities, behavioral traits, and occupational interests simultaneously. Profiles are matched against Performance Models (Job Match Patterns) to predict job success.

## Three Assessment Domains

### Domain I: Cognitive (Thinking Style) — 77 items
- **Verbal Skill** — vocabulary, synonym identification
- **Verbal Reasoning** — verbal analogies, logical deductions
- **Numerical Ability** — arithmetic calculations (calculator permitted)
- **Numeric Reasoning** — number sequences, multi-step word problems
- **Learning Index** — composite of all 4 cognitive scales (not independently measured)

Uses Computer Adaptive Testing (CAT) with 3-Parameter Logistic (3PL) IRT model:
P(θ) = c + (1-c) / (1 + e^(-a(θ-b)))
- θ = latent ability (-3 to +3)
- a = item discrimination (slope)
- b = item difficulty (location)
- c = pseudo-guessing parameter

Adaptive routing: starts at population mean, adjusts difficulty based on responses via MLE.

### Domain II: Behavioral Traits — 182 items
Nine constructs on a continuum (neither end is "better"):
1. **Energy Level** (pace) — task completion rate, drive
2. **Assertiveness** — influence, persuasiveness, confidence
3. **Sociability** — desire for interpersonal interaction
4. **Manageability** — reaction to external controls, conformity
5. **Attitude** — trust, optimism, positive outlook
6. **Decisiveness** — risk acceptance, speed of decision-making
7. **Accommodating** — agreeableness, group harmony
8. **Independence** — self-direction vs reliance on supervision
9. **Objective Judgment** — logical facts vs intuition

Mixed format: Likert scale + Multidimensional Forced-Choice (MFC) to resist social desirability bias.

### Domain III: Occupational Interests — 6 scales (Holland-influenced)
1. Enterprising — leadership, selling, promoting
2. Financial/Administrative — order, record keeping, routines
3. People Service — helping, collaboration
4. Technical — research, intellectual problem solving
5. Mechanical — manual work, tools, trades
6. Creative — imagination, artistic pursuits

Ipsative (forced-choice) format → converted to normative STEN scores. Only top 3 interests used for job matching.

## Distortion Scale
Embedded in behavioral section. Detects "faking good" via statistically improbable responses.
- STEN 7-10: Acceptable, candid responses
- STEN 3-6: Somewhat polished, flag for interview probing
- STEN 1-2: Invalid data, should not be used for decisions

## STEN Scoring
Standard Ten scale: mean=5.5, SD=2.0, scores 1-10.
Scores 4-7 = ~68% of working population.

## Job Match Algorithm
### Performance Models created via:
1. **Concurrent Study** — assess top/bottom performers (min 30), derive optimal STEN ranges
2. **Job Analysis Survey (JAS)** — structured questionnaire to stakeholders
3. **Performance Model Library** — pre-validated templates from O*NET database

### Overall Job Match Percent
Weighted: Cognitive 40% + Behavioral 40% + Interests 20%

Distance decay formula:
- Score inside model band → 0 deduction
- Each STEN unit outside → increasing penalty (compounding)
- d_i = max(0, L_i - S_i) + max(0, S_i - U_i) for each scale
- Interests: rank-order matching of top 3

Overall Fit = 0.4 * CognitiveFit + 0.4 * BehavioralFit + 0.2 * InterestFit

## Reports
1. Comprehensive Selection Report (main hiring report)
2. Multiple Candidates Report (compare candidates)
3. Multiple Positions Report (succession planning)
4. Coaching Report (development)
5. Team Report (behavioral dynamics)
6. Individual Feedback Report (personal growth)
7. Dynamic Interview Questions (generated for STEN deviations)

## Reliability Requirements
- Test-retest reliability
- Split-half reliability
- Cronbach's Alpha (target: 0.73-0.87 for behavioral scales)

## Legal Requirements
- EEOC compliant
- ADA compliant
- Rule of 4/5ths adverse impact analysis
- Age/gender/ethnicity blind
