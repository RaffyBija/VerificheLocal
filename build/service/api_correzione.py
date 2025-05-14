
from flask import Flask, request, jsonify
import openpyxl
import tempfile
import os
from collections import defaultdict

app = Flask(__name__)

@app.route('/valuta', methods=['POST'])
def valuta_file():
    if 'soluzione' not in request.files or 'studente' not in request.files:
        return jsonify({"errore": "Fornire entrambi i file: 'soluzione' e 'studente'."}), 400

    file_sol = request.files['soluzione']
    file_stud = request.files['studente']

    with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_sol,          tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_stud:

        file_sol.save(tmp_sol.name)
        file_stud.save(tmp_stud.name)

        report = confronta_excel(tmp_sol.name, tmp_stud.name)

        os.remove(tmp_sol.name)
        os.remove(tmp_stud.name)

        return jsonify(report)

def confronta_excel(file_soluzione, file_studente):
    wb_sol = openpyxl.load_workbook(file_soluzione, data_only=False)
    wb_stud = openpyxl.load_workbook(file_studente, data_only=False)
    
    ws_sol = wb_sol.active
    ws_stud = wb_stud.active

    verifica = {
        "formule": {
            "G": range(4, 25),   # Importo
            "H": range(4, 25),   # Sconto
            "J": range(4, 25),   # Dogana
            "I28": None,
            "I31": None
        },
        "valori": [
            "D27", "D28", "D29", "F29", "D30", "D31", "D33"
        ]
    }

    report = {
        "punti": 0,
        "max": 0,
        "raggruppamenti": {},
        "dettagli": []
    }

    colonne_descrizione = {
        "G": "Importo (colonna G)",
        "H": "Sconto (colonna H)",
        "J": "Dogana (colonna J)"
    }

    raggruppati = defaultdict(lambda: {"corrette": 0, "totali": 0})

    def check_formula(col, row):
        cell_sol = ws_sol[f"{col}{row}"]
        cell_stud = ws_stud[f"{col}{row}"]
        expected = cell_sol.value
        actual = cell_stud.value
        correct = expected == actual
        return {
            "cella": f"{col}{row}",
            "tipo": "formula",
            "corretta": correct,
            "attesa": expected,
            "trovata": actual,
            "colonna": col
        }, correct

    def check_valore(cell_ref):
        val_sol = ws_sol[cell_ref].value
        val_stud = ws_stud[cell_ref].value
        correct = False
        try:
            correct = abs(float(val_sol) - float(val_stud)) < 0.01
        except:
            correct = val_sol == val_stud
        return {
            "cella": cell_ref,
            "tipo": "valore",
            "corretta": correct,
            "atteso": val_sol,
            "trovato": val_stud
        }, correct

    for col, rows in verifica["formule"].items():
        if rows:
            for r in rows:
                res, correct = check_formula(col, r)
                report["max"] += 1
                if correct:
                    report["punti"] += 1
                    raggruppati[col]["corrette"] += 1
                raggruppati[col]["totali"] += 1
        else:
            res, correct = check_formula(col[:-2], col[-2:]) if col[0].isalpha() else check_formula(col, "")
            report["dettagli"].append(res)
            report["max"] += 1
            if correct:
                report["punti"] += 1

    for cell in verifica["valori"]:
        res, correct = check_valore(cell)
        report["dettagli"].append(res)
        report["max"] += 1
        if correct:
            report["punti"] += 1

    for col, stats in raggruppati.items():
        descrizione = colonne_descrizione.get(col, f"Colonna {col}")
        percentuale = round((stats["corrette"] / stats["totali"]) * 100, 2) if stats["totali"] else 0
        report["raggruppamenti"][descrizione] = {
            "corrette": stats["corrette"],
            "totali": stats["totali"],
            "percentuale": percentuale
        }

    return report

if __name__ == '__main__':
    app.run(port=5000, debug=True)
