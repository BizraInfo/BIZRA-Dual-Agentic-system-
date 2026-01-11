# Node0 Graph-of-Thoughts (GoT)

This graph reflects the current Node0 kernel flow with the added SynapseFrame gate.

## Mermaid

```mermaid
graph TD
    U[LLM / Agent Output] --> SF[SynapseFrame JSON]
    SF --> V{verify_synapse_frame}
    V -- reject --> R[Reject + Log]
    V -- pass --> K[SystemProtocolKernel.execute]
    K --> MV[MultiStageVerifier]
    K --> IV[IhsanVector]
    K --> SNR[SNRTracker]
    K --> SAPE[SAPEEngine]
    MV --> D{Kernel Pass?}
    IV --> D
    D -- fail --> F[FATE Escalation]
    D -- pass --> A[Approved Result]
    A --> P[Receipts / Evidence]
    F --> P
    P --> SYN[Synapse (Redis)]
```

## DOT

```dot
digraph Node0GoT {
  rankdir=LR;
  U [label="LLM / Agent Output"];
  SF [label="SynapseFrame JSON"];
  V [shape=diamond,label="verify_synapse_frame"];
  R [label="Reject + Log"];
  K [label="SystemProtocolKernel.execute"];
  MV [label="MultiStageVerifier"];
  IV [label="IhsanVector"];
  SNR [label="SNRTracker"];
  SAPE [label="SAPEEngine"];
  D [shape=diamond,label="Kernel Pass?"];
  F [label="FATE Escalation"];
  A [label="Approved Result"];
  P [label="Receipts / Evidence"];
  SYN [label="Synapse (Redis)"];

  U -> SF -> V;
  V -> R [label="reject"];
  V -> K [label="pass"];
  K -> MV;
  K -> IV;
  K -> SNR;
  K -> SAPE;
  MV -> D;
  IV -> D;
  D -> F [label="fail"];
  D -> A [label="pass"];
  A -> P;
  F -> P;
  P -> SYN;
}
```
