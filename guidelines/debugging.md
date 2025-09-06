
# How to Debug

## 1. Start Simple, Not Smart

**Don't theorize - read what's actually happening.**

- Read the error message word by word. What does it literally say?
- Look at the stack trace. Where exactly is it failing?
- Check the simplest explanation first: typo, missing return, wrong variable name

**Bad approach:** "This might be a complex Convex error propagation issue..."  
**Good approach:** "The error says 'Can not reach this point' - where is that text in the code?"

## 2. State Uncertainty, Not Facts

**Say "I think" not "This is how it works" unless you have proof.**

- "I think this might be..." instead of "This is definitely..."
- "In my experience..." instead of "The system always..."
- "Let me check if..." instead of "I know that..."

**Bad:** "Actions don't catch errors from ctx.runAction()"  
**Good:** "I suspect the error might not be getting caught - let's test that"
follow up with the simplest way to test that. 

## 3. Follow the Evidence Trail

**Let the actual behavior guide you, not your mental model.**

- Add targeted console.logs at key points
- Check what the user actually sees vs. what you think they should see
- List all the possible problem but start always do one test for one specific thing at a time

**Process:**
1. What is happening? (logs, error messages, user reports)
2. What should be happening? (expected behavior)
3. Where is the gap? (specific line/function)

## 4. Listen for Simplicity Signals

**When someone asks for "clarity and simplicity," they mean it's simpler than you think.**

- "Let's aim for clarity" = Stop overcomplicating
- "This seems complex" = Step back and find the simple solution
- "I just need..." = Focus on their actual need, not the architecture

**Red flags you're overcomplicating:**
- Proposing major refactors for small bugs
- Always ask what is the simplest way to fix this and the give me that answer.
- Talking about architecture when they want a quick fix
- Bringing up multiple possible causes instead of testing one

## 5. Ask Targeted Questions, Not Open-Ended Ones

**Good questions quickly narrow down the problem.**

**Instead of:** "Can you show me your error handling pattern?"  
**Ask:** "Can you show me the exact line where you return the error?"

**Instead of:** "How does your authentication work?"  
**Ask:** "What happens when you console.log the user object right before the error?"

**Instead of:** "What's your Convex setup?"  
**Ask:** "Does this error happen when you comment out line 23?"

## The Golden Rule

**When debugging, the error message is usually telling you exactly what's wrong. Your job is to listen to it, not outsmart it.**

Most bugs are simple. Complex explanations are usually wrong explanations.