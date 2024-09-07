import typer
import os
import numpy as np
from scipy.integrate import solve_ivp
import math
import json
from tqdm import tqdm

SOLVER_PARAMS = {
    "method": "LSODA",
    "atol": 10**-9,
    "rtol": 10**-6,
}

N_CYCLES = 1
N_CYCLE_POINTS = 600

DECIMALS = 6


def read_jsonl(filename: str):
    with open(filename, "r") as f:
        return [json.loads(line) for line in f]


def three_body_planar(t, y, params: dict):
    x1, y1, vx1, vy1, x2, y2, vx2, vy2, x3, y3, vx3, vy3 = y
    m1, m2, m3 = params["m1"], params["m2"], params["m3"]

    ax1 = (
        m2 * (x2 - x1) / math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 3
        + m3 * (x3 - x1) / math.sqrt((x1 - x3) ** 2 + (y1 - y3) ** 2) ** 3
    )
    ay1 = (
        m2 * (y2 - y1) / math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 3
        + m3 * (y3 - y1) / math.sqrt((x1 - x3) ** 2 + (y1 - y3) ** 2) ** 3
    )

    ax2 = (
        m3 * (x3 - x2) / math.sqrt((x2 - x3) ** 2 + (y2 - y3) ** 2) ** 3
        + m1 * (x1 - x2) / math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 3
    )
    ay2 = (
        m3 * (y3 - y2) / math.sqrt((x2 - x3) ** 2 + (y2 - y3) ** 2) ** 3
        + m1 * (y1 - y2) / math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 3
    )

    ax3 = (
        m1 * (x1 - x3) / math.sqrt((x3 - x1) ** 2 + (y3 - y1) ** 2) ** 3
        + m2 * (x2 - x3) / math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2) ** 3
    )
    ay3 = (
        m1 * (y1 - y3) / math.sqrt((x3 - x1) ** 2 + (y3 - y1) ** 2) ** 3
        + m3 * (y2 - y3) / math.sqrt((x3 - x2) ** 2 + (y3 - y2) ** 2) ** 3
    )

    return [vx1, vy1, ax1, ay1, vx2, vy2, ax2, ay2, vx3, vy3, ax3, ay3]


def integrate(condition: dict):
    m1, m2, m3 = condition["masses"]
    y0 = condition["initial_conditions"]
    T = condition["T"]

    t_max = N_CYCLES * T
    t_span = (0, t_max)
    t_eval = np.linspace(0, t_max, int(N_CYCLES * N_CYCLE_POINTS))

    sol = solve_ivp(
        three_body_planar,
        t_span,
        y0,
        t_eval=t_eval,
        args=({"m1": m1, "m2": m2, "m3": m3},),
        **SOLVER_PARAMS,
    )

    return sol


def parse_coordinates(y: np.ndarray) -> list[dict[str, list[float]]]:
    y = y.tolist()
    return [
        {"x": y[0], "y": y[1]},
        {"x": y[2], "y": y[3]},
        {"x": y[4], "y": y[5]},
    ]


def normalize_coordinates(coordinates: np.ndarray) -> np.ndarray:
    result = coordinates.copy()
    result = (result - np.min(result)) / np.ptp(result)
    result = result * 2 - 1
    result = result.round(DECIMALS)
    return result


def main(filename_input: str, folder_output: str):

    conditions = read_jsonl(filename_input)

    for condition in tqdm(list(conditions)):
        sol = integrate(condition)
        coordinates = sol.y[[0, 1, 4, 5, 8, 9]]
        normalized_coordinates = normalize_coordinates(coordinates)
        result = parse_coordinates(normalized_coordinates)

        os.makedirs(folder_output, exist_ok=True)
        filename_output = f"{folder_output}/{condition['name']}.json"
        with open(filename_output, "w") as f:
            json.dump(result, f, indent=2)


if __name__ == "__main__":
    typer.run(main)
