import os
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))


def create_chatbot_message(user_input, chat_history, user_name):
    """
    챗봇이 사용자의 입력에 대응하여 메시지를 생성합니다.
    """

    # 챗봇의 프롬프트 설정
    prompt = f"{chat_history}\n사용자: {user_input}\nArgo:"

    important_role = "DO NOT SAY GREETINGS. Translate all output to KOREAN and use polite word. "
    common_role = f"Your name is Argo. Users will call you Argo. The name of the person you are talking to is {user_name}. You are a superior who wants to get to know new employees. "
    goal = "The goal of the conversation is to share each other's hobbies. "
    
    # 새로운 OpenAI API를 사용하여 대화 생성
    response = client.chat.completions.create(model="gpt-3.5-turbo",
    messages=[
        {"role": "system", "content": goal},
        {"role": "assistant", "content": common_role + important_role},
        {"role": "user", "content": user_input}
    ])
    
    # 생성된 메시지를 반환
    message = response.choices[0].message.content
    return message

# 사용자의 이름을 입력받고 챗봇이 인사하는 부분
user_name = input("이름을 입력하세요: ")
user_input = f"안녕하세요! 저는 신입사원 {user_name}이라고 합니다."
print(f"사용자: {user_input}")

# 챗봇의 첫 응답 생성
chat_history = f"사용자: {user_input}"
chatbot_response = create_chatbot_message(user_input, chat_history, user_name)
print(f"Argo: {chatbot_response}")
chat_history += f"\Argo: {chatbot_response}"

# 대화 루프
while True:
    # 사용자 입력 받기
    user_input = input("사용자: ")
    chat_history += f"\n사용자: {user_input}"
    
    # 챗봇 응답 생성
    chatbot_response = create_chatbot_message(user_input, chat_history, user_name)
    print(f"Argo: {chatbot_response}")

    # 챗봇 응답을 대화 이력에 추가
    chat_history += f"\Argo: {chatbot_response}"

    # 종료 조건을 여기에 추가할 수 있습니다.
