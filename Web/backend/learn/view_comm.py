from operator import itemgetter
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from django.http import JsonResponse
import json
from django.views.decorators.csrf import csrf_exempt
import socket
import copy

template = """
이전 대화 내역 <history>와 정보 <information> 기반으로 사용자 입력 <input>에 대한 응답을 생성해주십시오. 
여기서 <ai /> 너를 지칭하며, <human />는 사용자를 의미합니다.
아래 <example> 은 너가 참고할 수 있는 응답 문장입니다. 이와 비슷하게 말하십시오.

<information>
{information}
</information>

<history>
{history}
</history>

<input>
{input}
</input>

<example>
{example}
</example>

응답은 한 문장으로 구성하며 한번에 한가지만 말합니다. <history> 내용을 두번 이상 반복하여 말하지 않습니다.
IMPORTANT: Do not repeat the same sentence in <history>.
응답:
"""

prompt1 = ChatPromptTemplate.from_template(template)
model1 = ChatOpenAI(temperature=0.0,
                    max_tokens=2048,
                    model_name='gpt-3.5-turbo-1106',)
output_parser1 = StrOutputParser()

chain1 = (
    {
        "information": itemgetter("information"),
        "history": itemgetter("history"),
        "input": itemgetter("input"),
        "example": itemgetter("example"),
    }
    | prompt1
    | model1
    | output_parser1
)



template2= """
Question:
{question}

<input>
{input}
</input>

내용이 존재하지 않으면 0, 존재하면 1로 표기하시오. 구분은 공백없이 쉼표 ','로 합니다.
Answer:
"""


#================================================================================
# user 에게 받아야 함.
#================================================================================
with open('./learn/test_data.json', 'r', encoding='utf-8') as f:
    dialog_data = json.load(f)
# backend\learn\test_data.json    
# information = dialog_data["information"]
# system_message = dialog_data["system_message"]
# chat_history = []
# dialog_subject = dialog_data["title"]
#================================================================================
# user 에게 받아야 함.
#================================================================================

#================================================================================
#                       communication/study/first/
#================================================================================
@csrf_exempt 
def chatbot_response1_first(request):
    if request.method == 'POST': 
        data = json.loads(request.body)

        # 나중에 user에게 문제 추천
        print(data)
        dialog_id = 0
        user_name = data["user_name"]
        answer = copy.deepcopy(dialog_data[dialog_id])

        answer["user_role"]["<Name:U>"] = user_name

        for key, value in (answer["user_role"] | answer["chatbot_role"]).items():
            answer["situation"] = answer["situation"].replace(key, value)
            answer["goal"] = answer["goal"].replace(key, value)
            answer["system_message"] = answer["system_message"].replace(key, value)
            for turn in answer["conversation"]:
                turn["sentence"] = turn["sentence"].replace(key, value)
                for index in range(len(turn["guide"])):
                    turn["guide"][index] = turn["guide"][index].replace(key, value)
            
        reply = ""
        if dialog_data[dialog_id]["conversation"][0]["speaker"] == "user":
            reply = "<START>"
        else: 
            reply = dialog_data[dialog_id]["conversation"][0]["sentence"]
            
        print("user", data["user_no"], "의 학습 데이터 아이디", dialog_id)
        
        return JsonResponse({'answer': answer, 'reply': reply, 'code': 0})

    return JsonResponse({"error": "Method not allowed"}, status=405)
    
#================================================================================
#                       communication/study/
#================================================================================
def get_system_message(system_message):
    return SystemMessage(content=system_message)

def generate_response1(history, input, information, example):  #, situation, goal, chatbot_role, user_role
    print("history len:", len(history))
    return chain1.invoke({
        "history": history, 
        "input": input,
        "information": information,
        "example": example,
    })
    
    
def make_history_list(history, system_message):
    history_list = []
    for sentence in history:
        if sentence["sentence"] != "<START>":
            if sentence['speaker'] == 'user' and sentence["check"] == 1:
                history_list.append(HumanMessage(content=sentence['sentence']))
            elif sentence['speaker'] == 'chatbot':
                history_list.append(AIMessage(content=sentence['sentence']))
    return [get_system_message(system_message)] + history_list
   
@csrf_exempt    
def chatbot_response1(request):
    if request.method == 'POST': 
        data = json.loads(request.body)
        
        # print(data)
        
        learning_data = data["answer"]
        user_message = data['message']
        chat_history = make_history_list(data['history'], learning_data["system_message"])
        information = learning_data["information"]
        example = learning_data["conversation"][len(chat_history)]["sentence"]
        code = 0
        
        print(chat_history)
        
        chatbot_response = generate_response1(chat_history, user_message, information, example)

        print(user_message, chatbot_response)
        
        if len(chat_history) + 1 >= len(learning_data["conversation"]):
            code = 1

        return JsonResponse({'reply': chatbot_response, 'code': code})
    return JsonResponse({"error": "Method not allowed"}, status=405)

#================================================================================
#                       communication/study/check/
#================================================================================

prompt2 = ChatPromptTemplate.from_template(template2)
model2 = ChatOpenAI(temperature=0.2,
                    max_tokens=2048,
                    model_name='gpt-3.5-turbo-1106',)
output_parser2 = StrOutputParser()

chain2 = (
    {
        "input": itemgetter("input"),
        "question": itemgetter("question"),
    }
    | prompt2
    | model2
    | output_parser2
)

def generate_response2(guideline, input):
    question = "\n".join([f"다음 입력 <input>에 '{g}' 내용이 있나요?" for g in guideline])
    print(question)
    return chain2.invoke({
        "question": question, 
        "input": input,
    })
   
@csrf_exempt    
def check_guideline(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        input = data["sentence"]
        guideline = data["guideline"]
        response = generate_response2(guideline, input)
        print(response)
        response = list(map(int, response.split(",")))
        check = 0 if 0 in response else 1
        return JsonResponse({'guide_label': response, "check": check})
    return JsonResponse({"error": "Method not allowed"}, status=405)

import time
#================================================================================
#                       communication/study/check/
#================================================================================
def scoring_7cs(message):
    # 모델 써야함 밑은 예시
    # 클라이언트 소켓 생성
    client_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

    # 서버 주소와 포트 설정
    server_address = ('lbsg98.duckdns.org', 18082)

    # 데이터 생성
    sendData = '%04d2001%s' % (len(message.encode('utf-8')), message)

    # 서버에 연결
    client_socket.connect(server_address)
    print('서버에 연결되었습니다.')

    try:
        # 메시지 입력 및 서버에 전송
        # message = input('전송할 메시지를 입력하세요: ')
        client_socket.sendall(sendData.encode('utf-8'))
        print("전송 성공")
        data = client_socket.recv(1024).decode('utf-8')
        head = data[:8]
        label = list(map(int, data[8:].split(",")))
        
        print('서버로부터 받은 응답:', label)

    except Exception as e:
        print(e)
        label = [0, 0, 0, 0, 0, 0, 0]
        # label = [1, 1, 1, 1, 1, 1, 1]
    finally:
        # 소켓 종료
        print('서버와의 연결이 종료되었습니다.')
        client_socket.close()
    return label

@csrf_exempt
def labeling_7cs(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        message = data.get("message", "")    # "message" 필드 추출
        # history = data.get("history", [])    # "history" 필드 추출
        [score_clear, score_concise, score_concrete, score_correct, score_coherent, score_complete, score_courteous] = scoring_7cs(message)
        print("labeling complete", score_clear, score_concise, score_concrete, score_correct, score_coherent, score_complete, score_courteous)
    return JsonResponse({'labels': {
        'Clear': score_clear,
        'Concise': score_concise,
        'Concrete': score_concrete,
        'Correct': score_correct,
        'Coherent': score_coherent,
        'Complete': score_complete,
        'Courteous': score_courteous
    }})

