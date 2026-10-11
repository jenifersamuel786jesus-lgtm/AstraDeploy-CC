"""
Deterministic Synthetic Dataset Generator for Cloud Resource Sizing
Labels synthetic data truthfully as required by prompt guidelines.
"""
import numpy as np
import pandas as pd

def generate_sizing_dataset(num_samples: int = 5000, random_seed: int = 42) -> pd.DataFrame:
    np.random.seed(random_seed)

    workload_types = ['web_api', 'microservice', 'ml_inference', 'batch_etl', 'database']
    environments = ['development', 'staging', 'production']

    type_choices = np.random.choice(workload_types, size=num_samples)
    env_choices = np.random.choice(environments, size=num_samples, p=[0.2, 0.3, 0.5])
    expected_rps = np.random.exponential(scale=1500, size=num_samples) + 50
    p99_latency_target = np.random.uniform(20, 300, size=num_samples)
    sla = np.random.choice([99.0, 99.9, 99.99], size=num_samples, p=[0.1, 0.4, 0.5])

    optimal_vcpu = []
    optimal_ram_gb = []

    for w_type, env, rps, lat, s in zip(type_choices, env_choices, expected_rps, p99_latency_target, sla):
        rps_per_core = 250 if w_type == 'web_api' else 50 if w_type == 'ml_inference' else 120
        raw_cores = rps / rps_per_core
        lat_factor = 1.5 if lat < 50 else 1.2 if lat < 120 else 1.0
        env_factor = 1.35 if env == 'production' else 0.85

        vcpu = max(2, int(np.ceil(raw_cores * lat_factor * env_factor)))
        ram = vcpu * (8 if w_type == 'database' else 4)

        optimal_vcpu.append(vcpu)
        optimal_ram_gb.append(ram)

    df = pd.DataFrame({
        'workload_type': type_choices,
        'environment': env_choices,
        'expected_rps': expected_rps,
        'p99_latency_target_ms': p99_latency_target,
        'availability_sla': sla,
        'optimal_vcpu': optimal_vcpu,
        'optimal_ram_gb': optimal_ram_gb,
        'is_synthetic': True  # Truthfully labeled synthetic dataset
    })

    return df

if __name__ == "__main__":
    df = generate_sizing_dataset(100)
    print(f"Generated {len(df)} synthetic telemetry samples:")
    print(df.head())
