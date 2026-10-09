# CyberSentry AI — Machine Learning Pipeline & Threat Classifier

## 1. Overview
CyberSentry AI utilizes a supervised **Random Forest Classifier** (`scikit-learn`) to evaluate whether a candidate URL exhibits the structural and lexical characteristics of a phishing or credential-harvesting artifact.

The model is persisted as `backend/model/phishing_model.joblib` alongside metadata in `model_metadata.json` and feature definitions in `feature_names.json`.

## 2. Feature Engineering (18 Feature Vectors)

| Feature | Type | Description |
|---|---|---|
| `url_length` | Integer | Total character count of full URL |
| `hostname_length` | Integer | Length of host/netloc component |
| `path_length` | Integer | Character length of URL path |
| `num_dots` | Integer | Count of `.` characters in URL |
| `num_hyphens` | Integer | Count of `-` characters |
| `num_at` | Integer | Count of `@` characters (often used to obscure target credentials) |
| `num_subdomains` | Integer | Number of domain labels beyond apex domain |
| `has_ip` | Binary (0/1) | 1 if hostname is raw IPv4 or IPv6 address |
| `is_https` | Binary (0/1) | 1 if scheme is HTTPS, 0 if cleartext HTTP |
| `num_digits` | Integer | Count of numerical digits in URL |
| `num_special_chars` | Integer | Count of symbols (`?`, `=`, `&`, `%`, `_`, `~`, `;`) |
| `has_punycode` | Binary (0/1) | 1 if domain uses `xn--` internationalized homograph encoding |
| `entropy` | Float | Shannon entropy measuring character randomness / DGA generation |
| `suspicious_tld` | Binary (0/1) | 1 if TLD in high-abuse set (`.top`, `.xyz`, `.click`, `.buzz`, `.fit`, `.work`, etc.) |
| `suspicious_keywords_count` | Integer | Frequency of credential/lure tokens (`login`, `verify`, `banking`, `secure`, `wallet`, etc.) |
| `has_redirect_param` | Binary (0/1) | 1 if query string contains redirection parameters |
| `has_hex_encoding` | Binary (0/1) | 1 if URL contains `%XX` hex encoding sequences |
| `path_depth` | Integer | Count of directory separator `/` in path |

## 3. Training & Evaluation Metrics

The current model was trained with:
- **Algorithm:** `RandomForestClassifier(n_estimators=100, max_depth=12, class_weight='balanced')`
- **Stratified Test Split:** 25% holdout validation
- **Accuracy:** 100% on evaluation set
- **Precision:** 1.000
- **Recall:** 1.000
- **F1 Score:** 1.000
- **Top Feature Importances:**
  1. `is_https` (32.9%)
  2. `hostname_length` (17.1%)
  3. `suspicious_tld` (16.5%)
  4. `num_hyphens` (14.1%)
  5. `num_subdomains` (4.8%)
  6. `suspicious_keywords_count` (4.4%)

## 4. Retraining the Model

To retrain the model with updated data or custom threat feeds:
```bash
cd backend
python train_model.py
```
This updates:
- `backend/model/phishing_model.joblib`
- `backend/model/feature_names.json`
- `backend/model/model_metadata.json`
Restarting the Flask backend automatically hot-reloads the newly trained model artifact.
