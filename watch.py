import time
import subprocess
import requests
import argparse
import uuid
import os
import re

# Set up argument parser
parser = argparse.ArgumentParser(description="Optional arguments.")
parser.add_argument('--local', type=bool, help='Run locally not sending any data')

# Parse the arguments
args = parser.parse_args()

# Access the arguments via args object
run_locally = args.local


def get_timestamp():
    return time.time()


def is_mining():
    try:
        process_count = int(subprocess.check_output('ps -x -o command | grep -c "python3 miner.py"', shell=True).decode("ascii").strip())
        return process_count > 1
    except:
        print("Error while running is_mining")
        return False


def get_difficulty():
    try:
        file = open("difficulty.txt", "r")
        difficulty = file.read().strip()
        file.close()
        return int(difficulty)
    except (ValueError, IOError) as e:
        return 0


def get_all_pids(args):
    try:
        return subprocess.check_output(args).decode("ascii").strip()
    except:
        return ""


def get_current_account():
    try:
        account_line = subprocess.check_output(["sed", "5q;d", "config.conf"]).decode("ascii").strip().split("=")[1]
        return account_line.strip()
    except:
        return ""


def get_all_hash_rates():
    gpu_hash_rate_dir = "hash_rates"
    hash_rates = []
    try:
        for filename in os.listdir(gpu_hash_rate_dir):
            filepath = os.path.join(gpu_hash_rate_dir, filename)
            try:
                with open(filepath, "r") as file:
                    hash_rate = float(file.read().strip())
                    hash_rates.append(hash_rate)
            except (ValueError, IOError) as e:
                # Ignore files with invalid content or that can't be read.
                pass
    except:
        return hash_rates
    return hash_rates


def get_nvidia_smi_data():
    query = "gpu_name,name,driver_version,pcie.link.gen.max,pcie.link.gen.current,temperature.gpu,temperature.memory,utilization.gpu,utilization.memory,memory.total,memory.free,memory.used,power.draw,clocks.current.memory,clocks.current.sm,uuid"
    try:
        details = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=" + QUERY, "--format=csv,noheader,nounits"]
        ).decode("ascii").strip()
        return {"query": query, "details": details}
    except:
        return {"query": query, "details": ""}


def get_gpu_found_blocks_tmp_updated_at():
    try:
        return os.path.getmtime("gpu_found_blocks_tmp")
    except:
        return ""


def get_all_gpu_found_block_count():
    try:
        stored_targets = ['XEN11', 'XUNI']

        block_count = 0
        xuni_count = 0
        xenblock_count = 0
        super_block_count = 0

        file = open("payload.log", "r")
        lines = file.readlines()
        file.close()
        for line in lines:
            block_count += 1
            only_hashed_data = line.strip().split("$")[5][:86]
            for target in stored_targets:
                if target in only_hashed_data:
                    if re.search("XUNI[0-9]", only_hashed_data):
                        xuni_count += 1
                    elif target == "XEN11":
                        capital_count = sum(1 for char in re.sub('[0-9]', '', only_hashed_data) if char.isupper())
                        if capital_count >= 50:
                            super_block_count += 1
                        else:
                            xenblock_count += 1

        return {
            "count": block_count,
            "xuni_count": xuni_count,
            "xenblock_count": xenblock_count,
            "super_block_count": super_block_count
        }
    except:
        return {
            "count": 0,
            "xuni_count": 0,
            "xenblock_count": 0,
            "super_block_count": 0
        }


def get_gpu_uuid():
    try:
        return subprocess.check_output(["nvidia-smi", "-i=0", "--query-gpu=uuid", "--format=csv,noheader"]).decode("ascii").strip().replace("GPU-", "")
    except:
        return str(uuid.uuid4())


def get_vast_ai_data():
    try:
        vast_ai_data = subprocess.check_output(["cat", "vast-data.txt"]).decode("ascii").strip()
        return vast_ai_data
    except:
        return ""


def ensure_worker_id():
    filename = "watch-worker-id.txt"

    if not os.path.isfile(filename):
        file = open(filename, "w")
        file.write(get_gpu_uuid())
        file.close()

    file = open(filename, "r")
    worker_id = file.read()
    file.close()

    return worker_id

INTERVAL_COUNT = 0
INTERVAL_RAPPID = 5
INTERVAL_NORMAL = 15
INTERVAL_DEFAULT = 45
def get_push_metrics_interval():
    global INTERVAL_COUNT
    global INTERVAL_RAPPID
    global INTERVAL_NORMAL

    print(INTERVAL_COUNT)

    if (INTERVAL_COUNT < 5):
        INTERVAL_COUNT += 1
        return INTERVAL_RAPPID

    if (INTERVAL_COUNT < 10):
        INTERVAL_COUNT += 1
        return INTERVAL_NORMAL

    return INTERVAL_DEFAULT

STARTED_AT = get_timestamp()
SERVER_ORIGIN = "https://www.xenblocks.app"
COMMIT_HASH = subprocess.check_output(["git", "rev-parse", "--short", "HEAD"]).decode("ascii").strip()
WORKER_ID = ensure_worker_id()

while True:
    ACCOUNT = get_current_account()
    time.sleep(5) # Wait a bit for miner to start
    if not ACCOUNT:
        print("Missing account in config.conf")
        continue

    while is_mining():
        INTERVAL = get_push_metrics_interval()
        TIMESTAMP = get_timestamp()
        DIFFICULTY = get_difficulty()
        HASH_RATES = get_all_hash_rates()
        PID_PYTHON3 = get_all_pids(["pidof", "python3"])
        PID_XENGPUMINER = get_all_pids(["pidof", "xengpuminer"])

        count_and_latest_payload = get_all_gpu_found_block_count()
        BLOCKS_FOUND_COUNT = count_and_latest_payload["count"]
        LATEST_BLOCKS_FOUND = get_gpu_found_blocks_tmp_updated_at()

        nvidia_data = get_nvidia_smi_data()
        QUERY = nvidia_data["query"]
        DETAILS = nvidia_data["details"]

        VAST_DATA = get_vast_ai_data()

        payload = {
            "ACCOUNT": ACCOUNT,
            "WORKER_ID": WORKER_ID,
            "COMMIT_HASH": COMMIT_HASH,
            "STARTED_AT": STARTED_AT,
            "INTERVAL": INTERVAL,

            "TIMESTAMP": TIMESTAMP,
            "DIFFICULTY": DIFFICULTY,
            "HASH_RATES": HASH_RATES,
            "PID_PYTHON3": PID_PYTHON3,
            "PID_XENGPUMINER": PID_XENGPUMINER,
            "BLOCKS_FOUND_COUNT": BLOCKS_FOUND_COUNT,
            "BLOCKS_XUNI": count_and_latest_payload["xuni_count"],
            "BLOCKS_XENBLOCK": count_and_latest_payload["xenblock_count"],
            "BLOCKS_SUPER": count_and_latest_payload["super_block_count"],
            "LATEST_BLOCKS_FOUND": LATEST_BLOCKS_FOUND,
            "QUERY": QUERY,
            "DETAILS": DETAILS,

            "VAST_DATA": VAST_DATA
        }

        print("Account: ", ACCOUNT)
        print("Worker: ", WORKER_ID)
        print("Difficulty: ", DIFFICULTY)
        print("Hash rates / GPU: ", HASH_RATES)
        print("Blocks found: ", BLOCKS_FOUND_COUNT)
        print("Visit: ", "https://www.xenblocks.app/" + ACCOUNT)

        # Prevent sending data to server if watch.py was triggered by scripts/test.sh (manual test)
        if run_locally:
            exit(0)

        url = "https://www.xenblocks.app/api/v1/" + ACCOUNT + "/meter-values"
        try:
            requests.post(url, json=payload)
        except:
            print("Error requests.post: ", url)

        time.sleep(INTERVAL)

    print("Missing miner.py process is not running")
    time.sleep(INTERVAL)
