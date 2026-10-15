"""A research agent: search the docs, then answer with citations."""

from typing import Literal

from langchain.chat_models import init_chat_model
from langchain_core.tools import tool
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode

MAX_RESULTS = 5
SYSTEM_PROMPT = "Answer from the docs. Cite every claim."


@tool
def search_docs(query: str, k: int = MAX_RESULTS) -> list[str]:
    """Return the top passages from the LangChain docs."""
    return [f"{query} (passage {i + 1})" for i in range(k)]


model = init_chat_model(
    "anthropic:claude-sonnet-5-5", temperature=0.2
).bind_tools([search_docs])


def call_model(state: MessagesState) -> dict:
    messages = [("system", SYSTEM_PROMPT), *state["messages"]]
    return {"messages": [model.invoke(messages)]}


def route(state: MessagesState) -> Literal["tools", "__end__"]:
    # Keep searching until the model stops calling tools.
    last = state["messages"][-1]
    return "tools" if last.tool_calls else END


builder = StateGraph(MessagesState)
builder.add_node("agent", call_model)
builder.add_node("tools", ToolNode([search_docs]))
builder.add_edge(START, "agent")
builder.add_conditional_edges("agent", route)
builder.add_edge("tools", "agent")

graph = builder.compile()
