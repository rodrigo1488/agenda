import mercadopago


def gerar_link_pagamento(plano):
    # Inicializar o SDK com o token de acesso
    sdk = mercadopago.SDK("APP_USR-8851343419813230-012519-e70fcecc90597940aacaceebdf1653c9-1360530545")

    # Configurar os dados de cada plano
    planos = {
        "mensal": {
            "id": "1",
            "title": "Assinatura da Sua Agenda - 1 mês",
            "unit_price": 1
        },
        "trimestral": {
            "id": "2",
            "title": "Assinatura da Sua Agenda - 3 meses",
            "unit_price": 3
        },
        "anual": {
            "id": "3",
            "title": "Assinatura da Sua Agenda - 1 ano",
            "unit_price": 12
        }
    }

    # Verificar se o plano é válido
    if plano not in planos:
        raise ValueError("Plano inválido!")

    # Dados do pagamento
    payment_data = {
        "items": [
            {
                "id": planos[plano]["id"],
                "title": planos[plano]["title"],
                "quantity": 1,
                "currency_id": "BRL",
                "unit_price": planos[plano]["unit_price"]
            }
        ],
        "back_urls": {
            "success": "http://www.suaagenda.fun/pagamentoaprovado",
            "failure": "http://www.suaagenda.fun/pagamentonaoaprovado",
            "pending": "http://www.suaagenda.fun/pagamentonaoaprovado",
        },
        "auto_return": "all",
        "payment_methods": {
            "excluded_payment_methods": [
                {"id": "pix"}  # Bloquear o Pix como método de pagamento
            ]
        }
    }

    # Criar a preferência de pagamento
    result = sdk.preference().create(payment_data)

    # Extrair o link de pagamento da resposta
    payment = result.get("response", {})
    link_pagamento = payment.get("init_point", "Link de pagamento não disponível")

    return link_pagamento
